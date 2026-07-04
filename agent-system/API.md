# MindArena Agent System — API для бэкенда

Сервис консилиума LLM. Бэкенд обращается сюда, чтобы согласовать тему, запустить дебат нескольких моделей
и получить ход рассуждений; события ретранслирует своему фронту и пишет в БД.

```
Браузер ──► Бэкенд (auth, БД, релей) ──► Agent System (этот сервис) ──► LLM-провайдеры
```

- Базовый URL по умолчанию: `http://localhost:8000`. Вход — JSON. Ход дебата — поток событий (SSE или опрос).
- **Интерактивная документация:** `GET /docs` (Swagger UI), `GET /redoc`, схема — `GET /openapi.json`.
- Стоимость/токены считаются внутри сервиса; бэкенду знать не обязательно.

## Авторизация
Каждый запрос (кроме `GET /health`, `GET /roles`) — заголовок `X-Agent-Key: <AGENT_SYSTEM_API_KEY>`.
Без него — `401`.

## Состав дебата и роли
Число участников = список `models` (id моделей). Расширенно — `participants: [{model, role}]`, где `role` —
id из `GET /roles` или своя метка; пусто = авто-ротация ролей. `participants` перекрывает `models`.

---

## Служебные

### GET /health
```json
{ "status": "ok",
  "models": { "CLAUDE": true, "KIMI": true, "DEEPSEEK": true, "GPT": false, "GEMINI": false, "GLM": true, "GROK": false },
  "registry": ["CLAUDE", "KIMI", "DEEPSEEK", "GLM"] }
```
`models` — у кого есть ключ; `registry` — реально поднятые агенты (доступный состав).

### GET /roles
```json
{ "roles": [ { "id": "strategist", "name": "Стратег-скептик", "lens": "…" }, … ] }
```
`id` (strategist/architect/practitioner/innovator/market/risk) можно передавать в `participants[].role`.

### GET /prompts — промпты агентов (просмотр и схема переопределения)
Возвращает все промпты: текущий текст, источник (`default`/`override`) и допустимые `$плейсхолдеры`.

Переопределение из админки: задать в env сервиса `PROMPTS_URL` — GET по этому URL должен вернуть JSON
`{"prompts": {"<ключ>": "<текст шаблона>", ...}}`. Ключи и их плейсхолдеры — ровно те, что отдаёт
`GET /prompts` (например `attack.system` с `$role_name/$lens/$mode_rule/$lang`, `improve.system`,
`intake.system`, `classify.system`, `quantum.generate.system`, `inject.classify.system` и т.д.).
Неизвестные ключи и не-строки игнорируются; если URL недоступен или вернул мусор — работают дефолты
из кода. Кэш перечитывается раз в `PROMPTS_TTL_SECONDS` (по умолчанию 300с).

### POST /debates/ping · GET /debates/ping/{checkId}
Асинхронная проверка живости моделей (пинг по 1 токену). `POST` без тела → `{ checkId, done:false, sent, models:{…"pending"} }`.
`GET` опрашивать раз в ~1с:
```json
{ "checkId":"…", "done":true, "sent":"Ответь одним словом: ок",
  "models":{ "CLAUDE":true, "GPT":false, "KIMI":true },
  "latency":{ "CLAUDE":1.3 }, "response":{ "CLAUDE":"Ок", "GPT":"insufficient_quota…" } }
```
Значение: `true` (ответила) · `false` (ошибка/битый ключ/таймаут 60с) · `"pending"`. Живёт ~5 мин.

---

## 1. POST /debates/intake — приёмщик (согласовать тему)
Модель ведёт диалог с пользователем и согласует тему **до** запуска. Память = история диалога (её передаёт
бэкенд, сервис без состояния). Вызывать на каждый ход пользователя.

**Тело:** `{ "messages":[{role,content}], "strategy":"VERIFY", "mode":"CONVERGENT", "locale":"ru" }`
(`role` = `user|assistant`, последний — `user`; `strategy/mode` — выбранный тип, приёмщик ведёт под него).

**Ответ:** `{ "ready":false, "message":"текст пользователю", "thesis":"", "strategy":"VERIFY", "mode":"CONVERGENT", "model":"CLAUDE" }`
Пока `ready=false` — показать `message`, взять ответ, добавить в `messages`, вызвать снова. При `ready=true`
— запускать дебат с `thesis`, `strategy`, `mode`. `message` — только живой текст (сервис чистит артефакты).

## 2. POST /debates/detect — пред-старт: авто-определение режима (опционально)
Дешёвой моделью определяет режим по ТЗ (Verify/Explore + подтип). Дебат не запускает.

**Тело:** `{ "thesis":"…", "models":[…], "maxRounds":3 }`
```json
{ "canRun": true, "reason": "открытый вопрос — генерируем ответы",
  "strategy": "QUANTUM", "mode": "CONVERGENT", "exploreType": "IDEAS",
  "confidence": 0.91, "borderline": false, "alternative": "VERIFY", "classifiedBy": "CLAUDE",
  "availableModels": ["CLAUDE","KIMI","DEEPSEEK"], "estimatedCostUsd": 4.5, "estimatedRounds": 3 }
```
- `strategy` — `VERIFY` (проверить утверждение) или `QUANTUM` (открытый вопрос → генерировать ответы).
- `mode` — подтип VERIFY (`CONVERGENT`/`DIVERGENT`/`GEOPOLITICAL`); `exploreType` — подтип QUANTUM (`IDEAS`/`MECHANISMS`/`SOLUTIONS`/`ANOMALIES`).
- `confidence` 0–1; `borderline=true` при низкой уверенности → покажите переключатель на `alternative`.
- `classifiedBy` — какая модель определила режим (или `heuristic` при фолбэке). Модель классификатора
  задаётся `CLASSIFY_MODEL` в env (пусто = как у приёмщика, `INTAKE_MODEL`/преференс).
- `canRun=false` → показать `reason`, не запускать.

То же авто-определение срабатывает и при запуске дебата с пустым `strategy:""` (Verify/Explore выберется сам).

## 3. POST /debates/baseline — «один промпт» (для сравнения)
**Тело:** `{ "thesis":"…", "model":"CLAUDE", "locale":"ru" }` (model опц.) → `{ "model":"CLAUDE", "answer":"…" }`.

---

## 4. Запуск дебата

Тело запроса (общее для `/debates/start` и `/debates/run`):

| Поле | Тип | Дефолт | Описание |
|------|-----|--------|----------|
| `thesis` | string | — | Тема/тезис (обяз.) |
| `strategy` | string | `VERIFY` | `VERIFY` (петля истины) \| `QUANTUM` (перебор идей) \| `""` авто |
| `mode` | string | `CONVERGENT` | Для VERIFY: `CONVERGENT` \| `DIVERGENT` \| `GEOPOLITICAL` |
| `maxRounds` | int | `3` | VERIFY: раундов (1–10) |
| `models` | string[] | `["CLAUDE","KIMI","DEEPSEEK"]` | Состав; модели без ключа отсеиваются |
| `participants` | `{model,role}[]` | — | Кто какую роль занимает; перекрывает `models` |
| `attackTimeoutSeconds` | int | из env | Ожидание ответов в раунде/поколении (5–300) |
| `quantumGenerations` | int | из env | QUANTUM: число поколений (1–6) |
| `quantumBranchesPerGen` | int | из env | QUANTUM: веток за поколение (2–60) |
| `quantumTopK` | int | из env | QUANTUM: сколько лучших проходит дальше (1–20) |
| `debateId` | string | генерится | Id на стороне бэкенда |
| `locale` | string | `ru` | Язык вывода |

Все числовые параметры зажимаются в указанные пределы; если не переданы — берётся дефолт из env сервиса.
`participants`/`models`, роли, режим и tuning-параметры задаются на запрос — env только дефолты.

### 4a. Опрос — POST /debates/start + GET /debates/{debateId}/events
Для окружений, где SSE буферизуется. `start` запускает дебат в фоне и сразу возвращает:
`{ "debateId":"…", "strategy":"VERIFY", "models":[…], "roster":[{model,role}] }`.
Затем опрашивать раз в ~0.7с:
```json
GET /debates/{id}/events?since=N
{ "debateId":"…", "done":false, "nextIndex":5, "events":[ { "event":"agent.attack.created", "data":{…} }, … ] }
```
Передавать `since = nextIndex`, остановиться при `done=true`.

> **Персистентность и история — на стороне бэкенда.** Этот сервис намеренно stateless: `/debates/start`
> держит активный дебат в памяти (завершённые кэшируются ~1ч, активные не выселяются) как удобство для
> опроса. Источник правды — БД бэкенда: он получает события (через SSE-релей или опрос) и сохраняет их у
> себя, оттуда же отдаёт фронту историю, feed и возврат к завершённым дебатам. GET списка/одного дебата,
> rooms, авторизация — тоже слой бэкенда.

### 4c. POST /debates/{debateId}/inject — human injection (комментарий в идущий дебат)
Пользователь пишет свободный текст; тип определяет система лёгкой моделью
(`attack` / `clarify` / `alternative` / `example`; `redirect` в MVP приравнен к `alternative`;
`noise` отклоняется). Токен-гейта нет — инъекция входит сразу, на ближайший раунд (VERIFY) или
поколение (QUANTUM), наравне с ходами моделей.

**Тело:** `{ "text": "свободный текст комментария" }`

**Ответы:**
```json
{ "status": "queued", "type": "example", "author": "human", "willApplyRound": 2 }
{ "status": "queued", "type": "alternative", "author": "human", "willApplyGeneration": 2 }
{ "status": "rejected", "reason": "не удалось встроить как аргумент — попробуйте конкретнее" }
```
`rejected` — показать пользователю `reason` и предложить переформулировать (это 200, не ошибка).
Ошибки: `401`, `404` (неизвестный `debateId`), `409` (дебат уже завершён — инъекция не применена).

В потоке событий появятся:
| event | data |
|-------|------|
| `human.injection.applied` | `{ debateId, round\|generation, type, content, assignedTo, metadata:{attackId\|branchId, author:"human"} }` — UI: «Твой аргумент получен, [assignedTo] отвечает в раунде N» |
| `human.injection.rejected` | `{ debateId, round\|generation, text, reason }` — не прошла проверку аргумента уже в петле |

Дальше обычная логика: улучшение отвечает на инъекцию наравне с атаками ИИ; закрытие human-атаки
проверяет назначенная модель (`assignedTo`), не пользователь. В QUANTUM инъекция входит как гипотеза
в пул поколения и оценивается наравне с ветками.

### 4b. Поток — POST /debates/run (SSE)
`Accept: text/event-stream`. Кадры `event:` / `data:` до `debate.completed` или `debate.failed`.
**Важно:** кадры разделены `\r\n\r\n` — убирайте `\r` перед разбивкой (иначе `split("\n\n")` не сработает).

### События (VERIFY)
| event | data |
|-------|------|
| `debate.started` | `{ debateId, thesis, mode, strategy, models[] }` |
| `round.started` | `{ debateId, round }` |
| `agent.attack.created` | `{ debateId, eventId, roundNumber, agent, role, content, metadata:{ attackId, provider } }` |
| `thesis.improved` | `{ debateId, round, thesis, agent, role, changed, closedAttack, stillWeak }` |
| `attack.verified` | `{ debateId, attackId, agent, verdict }` — `verdict`: `closed`\|`partial`\|`open` (проверяет тот, кто атаковал) |
| `round.completed` | `{ debateId, round, survived, total }` |
| `mode.switched` | `{ debateId, from:"VERIFY", to:"QUANTUM", reason }` — редко: дебат «застрял» на критике формы, дальше идут события QUANTUM |
| `debate.completed` | `{ debateId, thesis, final }` |
| `debate.failed` | `{ debateId, reason }` |

> После `mode.switched` в том же `debateId` пойдут события QUANTUM (`branch.*`, `generation.completed`) и один
> общий `debate.completed`. Второго `debate.started` не будет — обрабатывайте обе группы событий в одном дебате.

### События (QUANTUM) — вместо петли атак
| event | data |
|-------|------|
| `debate.started` | `{ …, mode:"EXPLORE", strategy:"QUANTUM" }` |
| `branch.created` | `{ debateId, id, generation, lens, text }` |
| `branch.scored` | `{ debateId, id, score, breakdown:{ novelty, feasibility, scale, hiddenDemand, analogy } }` |
| `branch.promoted` | `{ debateId, id, verifiedScore }` |
| `generation.completed` | `{ debateId, generation, explored, survived }` |
| `debate.completed` | `{ debateId, thesis, final }` (в final — `topBranches`) |

### Объект `final`
```json
{ "opportunityScore": 0, "conclusion": "итог по режиму",
  "childQuestions": [], "researchGaps": [], "crossDomainHypotheses": [],
  "profitPatterns": ["название: описание"], "fundingBranches": [],
  "topBranches": [ { "id":"…", "text":"идея", "score":80, "agent":"CLAUDE" } ] }
```
`conclusion` есть всегда (зависит от `mode`). `topBranches` — только для `QUANTUM`.

---

## Коды ошибок
| Код | Когда |
|-----|-------|
| `401` | Нет/неверный `X-Agent-Key` |
| `422` | Невалидное тело (например пустой `thesis`) |
| `400` | Короткий `thesis`, либо нет ни одной модели с ключом |
| `404` | Неизвестный/истёкший `debateId` или `checkId` |
| `502` | Модель не ответила (для `baseline`) |

После старта SSE/опроса ошибка приходит событием `debate.failed`.

## Рекомендация по интеграции
1. (опц.) `POST /debates/ping` — узнать живой состав моделей.
2. `POST /debates/intake` с историей диалога, пока не придёт `ready=true`.
3. Создать `Debate` в БД, взять `debateId`, вызвать `POST /debates/start` (опрос) или `/debates/run` (SSE).
4. События ретранслировать своему фронту и писать в БД. Маппинг: `title` ← `thesis` из `debate.started`;
   `subtitle` ← `thesis` из последнего `thesis.improved`; `final` ← из `debate.completed`.

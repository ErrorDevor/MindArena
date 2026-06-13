import React from "react";
import NextImage from "next/image";
import { GetComponentProps } from "shared/lib/typescript/mixins";

type ImageProps = GetComponentProps<typeof NextImage> & {
  isWebp?: boolean;
};

const wrapSrc = (src: string) => src;

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, quality = 90, isWebp = true, ...props }, ref) => {
    const source =
      `${wrapSrc(src.toString())}?q=${quality}` + (isWebp ? "&fm=webp" : "");
    return <NextImage {...props} ref={ref} src={source} />;
  }
);

const ImageDefault = React.forwardRef<
  HTMLImageElement,
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >
>((props, ref) => {
  return (
    <img
      {...props}
      alt={props.alt || ""}
      src={props.src}
      ref={ref}
      loading="lazy"
    />
  );
});

export default Object.assign(Image, { Default: ImageDefault });

import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { getRegisteredCldImage } from "../../../shared/utils/cld";

type ShareButtonSharedProps = {
  children: ReactNode;
  labelClassName?: string;
};

type ShareButtonButtonProps = ShareButtonSharedProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

type ShareButtonLinkProps = ShareButtonSharedProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  href: string;
};

type ShareButtonProps = ShareButtonButtonProps | ShareButtonLinkProps;

/**
 * A button styled as the gold plaque artwork (`wedding.share-button`), with
 * caller-supplied text laid over it. Sizing/spacing belongs at the call
 * site via `className`, same convention as `WeddingSectionDivider`.
 */
export function ShareButton(props: ShareButtonProps) {
  const plaque = getRegisteredCldImage("wedding.share-button", { width: 900 });
  const buttonClassName = ["share-button relative inline-flex min-h-11 items-center justify-center", props.className].filter(Boolean).join(" ");
  const label = (
    <span className={["share-button__label gold-text relative z-10 px-10 text-sm leading-none md:text-base", props.labelClassName].filter(Boolean).join(" ")}>
      {props.children}
    </span>
  );
  const background = (
    <img
      src={plaque.url}
      alt=""
      aria-hidden="true"
      className="share-button__background absolute inset-0 h-full w-full object-contain"
      loading="lazy"
      decoding="async"
    />
  );

  if ("href" in props) {
    const { children: _children, className: _className, labelClassName: _labelClassName, href, ...anchorProps } = props;

    return (
      <a href={href} className={buttonClassName} {...anchorProps}>
        {background}
        {label}
      </a>
    );
  }

  const { children: _children, className: _className, labelClassName: _labelClassName, type = "button", ...buttonProps } = props;

  return (
    <button
      type={type}
      className={buttonClassName}
      {...buttonProps}
    >
      {background}
      {label}
    </button>
  );
}

import  { ReactNode, FC } from 'react';

interface ButtonProps {
    className?: string;
    children: ReactNode;
    Icon?: FC;
    mode: string;
}

export const Button: FC<ButtonProps> = ({ className, children, Icon, mode, ...props }) => {
    let cssClasses = `button ${mode}-button`;

    if (Icon) {
        cssClasses += ' icon-button';
    }

    if (className) {
        cssClasses += ' ' + className;
    }

    return (
        <button className={cssClasses} {...props}>
            {Icon && (
                <span className="button-icon">
                    <Icon />
                </span>
            )}
            <span>{children}</span>
        </button>
    );
};
  
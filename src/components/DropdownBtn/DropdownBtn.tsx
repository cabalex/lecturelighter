import { useState } from 'react';
import './DropdownBtn.css';

function DropdownBtn(
    {children, className, title, options, value, onSelect} :
    {children: any, className?: string, title?: string, options: {name: string, value: any}[], value: any, onSelect: (option: any) => void}
) {
    let [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={"dropdown " + (className || "") + (isOpen ? " open" : "")}
            title={title}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            >
            {children}
            <div className="dropdownOptions">
                {options.map((option, i) => (
                    <div
                        key={i}
                        className={value === option.value ? "selected" : ""}
                        onClick={() => { onSelect(option.value); setIsOpen(false) }}>
                            {option.name}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DropdownBtn;
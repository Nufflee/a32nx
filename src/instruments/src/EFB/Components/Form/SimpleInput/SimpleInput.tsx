import React, { useEffect, useState } from 'react';

type SimpleInputProps = {
    label?: string,
    placeholder?: string,
    value?: any,
    onChange?: (value: string) => void,
    onFocus?: (value: string) => void,
    onBlur?: (value: string) => void
    min?: number,
    max?: number,
    number?: boolean,
    noLeftMargin?: boolean,
    padding?: number,
    decimalPrecision?: number,
    reverse?: boolean, // Flip label/input order,
    className?: string,
    maxLength?: number,
    noLabel?: boolean,
    disabled?: boolean,
};

const pad = (value: string, padding?: number): string => {
    if (padding === undefined) return value;
    const split = value.split('.');
    while (split[0].length < padding) {
        split[0] = `0${split[0]}`;
    }
    return split.join('.');
};

const getConstrainedValue = (value: string, min?: number, max?: number, decimalPrecision?: number, padding?: number): string => {
    let constrainedValue = value;
    let numericValue = parseFloat(value);

    if (!Number.isNaN(numericValue)) {
        if (min !== undefined && numericValue < min) {
            numericValue = min;
        } else if (max !== undefined && numericValue > max) {
            numericValue = max;
        }

        if (decimalPrecision !== undefined) {
            const fixed = numericValue.toFixed(decimalPrecision);
            constrainedValue = parseFloat(fixed).toString(); // Have to re-parse to remove trailing 0s
        } else {
            constrainedValue = numericValue.toString();
        }
        constrainedValue = pad(constrainedValue, padding);
    }
    return constrainedValue;
};

const SimpleInput = (props: SimpleInputProps) => {
    const [displayValue, setDisplayValue] = useState<string>(props.value?.toString() ?? '');
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        if (props.value === undefined || props.value === '') {
            setDisplayValue('');
            return;
        }
        if (focused) return;
        setDisplayValue(getConstrainedValue(props.value, props.min, props.max, props.decimalPrecision, props.padding));
    }, [props.value, props.min, props.max, props.decimalPrecision, props.padding, focused]);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (!props.disabled) {
            let originalValue = event.currentTarget.value;

            if (props.number) {
                originalValue = originalValue.replace(/[^\d.-]/g, ''); // Replace all non-numeric characters
            }

            props.onChange?.(originalValue);
            setDisplayValue(originalValue);
        }
    };

    const onFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
        setFocused(true);
        if (!props.disabled) {
            props.onFocus?.(event.target.value);
        }
    };

    const onFocusOut = (event: React.FocusEvent<HTMLInputElement>): void => {
        const { value } = event.currentTarget;
        const constrainedValue = getConstrainedValue(value, props.min, props.max, props.decimalPrecision, props.padding);

        setDisplayValue(constrainedValue);
        setFocused(false);

        if (!props.disabled) {
            props.onBlur?.(event.target.value);
        }
    };

    useEffect(() => {
        if (focused) {
            Coherent.trigger('FOCUS_INPUT_FIELD');
        } else {
            Coherent.trigger('UNFOCUS_INPUT_FIELD');
        }
    }, [focused]);

    return (
        <>
            {props.noLabel
                ? (
                    <>
                        <input
                            className={`px-5 py-1.5 text-lg text-gray-300 rounded-lg bg-navy-light border-2 border-navy-light focus-within:outline-none
                            focus-within:border-teal-light-contrast ${props.className}`}
                            value={displayValue}
                            placeholder={props.placeholder ?? ''}
                            onChange={onChange}
                            onFocus={onFocus}
                            onBlur={onFocusOut}
                            maxLength={props.maxLength}
                            disabled={props.disabled}
                        />
                    </>
                )
                : (
                    <>
                        <div className={`flex ${props.reverse ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`text-lg flex flex-grow ${props.noLeftMargin ? '' : 'm-2.5'} items-center ${props.reverse ? 'justify-start' : 'justify-end'}`}>{props.label}</div>
                            <div className="flex items-center">
                                <input
                                    className={`px-5 py-1.5 text-lg text-white rounded-lg bg-navy-light border-2 border-navy-light focus-within:outline-none
                                    focus-within:border-teal-light-contrast ${props.className}`}
                                    value={displayValue}
                                    placeholder={props.placeholder ?? ''}
                                    onChange={onChange}
                                    onFocus={onFocus}
                                    onBlur={onFocusOut}
                                    maxLength={props.maxLength}
                                    disabled={props.disabled}
                                />
                            </div>
                        </div>
                    </>
                )}
        </>
    );
};

export default SimpleInput;

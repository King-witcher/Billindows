import { JSX } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = JSX.IntrinsicElements['input']

export function InputGroup({ placeholder, className, ...rest }: Props) {
  return (
    <div className="relative w-full">
      <style jsx>{`
        input + label {
          position: absolute;
          left: 12px;
          top: 50%;
          translate: 0 -50%;
          background: white;
          padding: 0 2px;
          transition: .15s ease-out;
          pointer-events: none;
        }

        input:focus {
          border: 2px solid var(--color-emerald-700);
        }

        input:focus + label {
          color: var(--color-emerald-700);
        }

        input:focus + label, input:not(:placeholder-shown) + label {
          top: 0;
          font-size: 12px;
        }
      `}</style>
      <input
        className={twMerge(
          'border-1 border-gray-300 text-red- h-[50px] p-[0_16px] w-full rounded-[4px] focus:outline-none text-gray-700 transition-colors duration-300',
          className
        )}
        {...rest}
        placeholder=""
      />
      <label className="text-gray-400" htmlFor={rest.name}>
        {placeholder}
      </label>
    </div>
  )
}

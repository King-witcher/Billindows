'use client'

import { JSX } from 'react'
import { twMerge } from 'tailwind-merge'

import styles from './button.module.sass'

type Props = JSX.IntrinsicElements['button']

export function Button({ className, ...rest }: Props) {
  return <button className={twMerge(styles.primary, className)} {...rest} />
}

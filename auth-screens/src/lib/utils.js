import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Properly merge Tailwind classes and conditionally add classes
 * @param args
 * @returns string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Grab the field specific errors from the SDK at `screen.errors`
 * @param String field
 * @param Array errors
 * @returns Array of error objects
 */
export function getFieldErrors(field, errors) {
  return errors?.length === 0 ? [] : errors?.filter((error) => error.field === field);
}


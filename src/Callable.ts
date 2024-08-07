import type { IterationType } from './Iteration';

export type Callable<Context, Element> = {
    call(context: Context, element: Element, index: number, iteration: IterationType<Element>): void;
} | ((this: Context, element: Element, index: number, iteration: IterationType<Element>) => void);
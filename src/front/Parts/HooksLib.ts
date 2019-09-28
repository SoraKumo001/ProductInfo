import { useRef } from "react";

/**
 *Hooks用初期化フック
 *
 * @param {()=>void} proc
 */
export function useInit(proc: () => void) {
  const ref = useRef(true);
  if (ref.current) {
    ref.current = false;
    proc();
  }
}

/**
 *Hooks用副作用無しのデータフック
 *
 * @template T
 * @param {(T | (() => T))} values
 * @returns
 */
export function useProperty<T>(values: T | (() => T)) {
  const ref = useRef<T>();
  if (ref.current === undefined) {
    if (values instanceof Function) {
      ref.current = values();
    } else {
      ref.current = values;
    }
  }
  return ref.current!;
}
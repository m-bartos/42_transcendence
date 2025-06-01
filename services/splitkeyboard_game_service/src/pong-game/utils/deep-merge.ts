type Primitive = string | number | boolean | bigint | symbol | undefined | null;

function isObject(item: any): item is Record<string, any> {
    return item !== null && typeof item === 'object' && !Array.isArray(item);
}

export function deepMerge<T>(target: T, source: Partial<T>): T {
    if (!isObject(target) || !isObject(source)) {
        return source as T;
    }

    const result = { ...target };

    for (const key in source) {
        if (source[key] === undefined) continue;

        if (isObject(source[key]) && isObject((target as any)[key])) {
            (result as any)[key] = deepMerge((target as any)[key], (source as any)[key]);
        } else {
            (result as any)[key] = source[key];
        }
    }

    return result;
}

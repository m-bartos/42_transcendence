import fs from "node:fs";

type Secrets = {
    [key: string]: string;
}

function isSecrets(value: unknown): value is Secrets {
    // 1. Check if it's a non-null object.
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    return true;
}


export function applySecret(secretName: string): string | undefined {

    try {
        const environment = process.env;
        const secretValue = environment[secretName];

        return secretValue;

    } catch (error) {
        console.error("Error reading or parsing secrets file:", error);
        return undefined;
    }
}

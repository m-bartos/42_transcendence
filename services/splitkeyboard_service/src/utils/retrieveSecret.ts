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
    const secretPath = process.env.SECRETS;

    if (!secretPath) {
        console.error("Error: SECRETS environment variable is not set.");
        return undefined;
    }

    try {
        const secretsContent = fs.readFileSync(secretPath, 'utf8');
        const parsedJson: unknown = JSON.parse(secretsContent);

        if (!isSecrets(parsedJson)) {
            console.error("Error: The secrets file content is not in the expected format.");
            return undefined;
        }
        return parsedJson[secretName];

    } catch (error) {
        console.error("Error reading or parsing secrets file:", error);
        return undefined;
    }
}

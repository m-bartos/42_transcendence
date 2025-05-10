export class ApiErrors extends Error {
    public status: number;
    public details?: any;

    constructor(status: number, message: string, details?: any) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.details = details;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
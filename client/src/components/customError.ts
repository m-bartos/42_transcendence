export class CustomError extends Error {
    public code: number;
    public messages: string[];
  
    constructor(code: number, ...messages: string[]) {
      // Vytvoříme hlavní zprávu sloučením všech předaných zpráv
      const mainMessage = messages.join("; ");
      super(mainMessage);
      this.code = code;
      this.messages = messages;
  
      // Nastavení prototype, aby instanceof správně fungoval
      Object.setPrototypeOf(this, CustomError.prototype);
    }
  }

  // Použití:
// const err2 = new CustomError(500, "Internal server error", "Database unreachable");
// console.log(err2 instanceof Error);  // true
// console.log(err2.code);              // Vypíše: 500
// console.log(err2.messages);          // Vypíše: [ 'Internal server error', 'Database unreachable' ]
interface CustomAlertOptions {
    message: string;
    title?: string;
    buttonText?: string;
    duration?: number; // Automatické zavření v ms (volitelné)
    type?: 'info' | 'success' | 'warning' | 'error';
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
    onClose?: () => void;
  }
  
  class CustomAlert {
    private container: HTMLDivElement;
    private options: CustomAlertOptions;
    private isVisible: boolean = true;
    private timeoutId: number | null = null;
    private resolvePromise: ((value: boolean) => void) | null = null;
  
    constructor(options: CustomAlertOptions) {
      this.options = {
        buttonText: 'OK',
        type: 'info',
        position: 'top-right',
        ...options
      };
      this.container = document.createElement('div');
      this.render();
      this.setupAutoClose();
    }
  
    private getTypeStyles(): { container: string; button: string } {
      const styles = {
        info: {
          container: 'border-blue-200 bg-blue-50 text-gray-700 text-center text-lg/9 whitespace-pre-line',
          button: 'bg-blue-500 hover:bg-blue-600 text-white'
        },
        success: {
          container: 'border-green-200 bg-green-50 text-gray-700 text-center text-lg/9 whitespace-pre-line',
          button: 'bg-green-500 hover:bg-green-600 text-white'
        },
        warning: {
          container: 'border-yellow-200 bg-yellow-50 text-gray-700 text-center text-lg/9 whitespace-pre-line',
          button: 'bg-yellow-500 hover:bg-yellow-600 text-white'
        },
        error: {
          container: 'border-red-200 bg-red-50 text-gray-700 text-center text-lg/9 whitespace-pre-line',
          button: 'bg-red-500 hover:bg-red-600 text-white'
        }
      };
  
      return styles[this.options.type || 'info'];
    }
  
    private getPositionStyles(): string {
      const positions = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      };
  
      return positions[this.options.position || 'top-right'];
    }
  
    private render(): void {
      const { message, title, buttonText } = this.options;
      const typeStyles = this.getTypeStyles();
      const positionStyles = this.getPositionStyles();
  
      // Vytvořit container pro alert
      this.container.className = `fixed z-50 ${positionStyles}`;
      document.body.appendChild(this.container);
  
      // Alert box
      const alertBox = document.createElement('div');
      alertBox.className = `rounded-lg border-1 p-4 shadow-lg shadow-gray-200 max-w-md ${typeStyles.container}`;
      
      // Přidat animaci pro vstup
      alertBox.style.animation = 'fadeIn 0.3s ease-out';
      alertBox.style.opacity = '1';
      
      // Přidat CSS pro animaci
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
      
      // Title (volitelný)
      if (title) {
        const titleElement = document.createElement('h3');
        titleElement.className = 'font-bold mb-2';
        titleElement.textContent = title;
        alertBox.appendChild(titleElement);
      }
      
      // Message
      const messageElement = document.createElement('p');
      messageElement.className = 'mb-4';
      messageElement.textContent = message;
      alertBox.appendChild(messageElement);
      
      // Button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'flex justify-end';
      
      // OK button
      const button = document.createElement('button');
      button.className = `px-4 py-2 rounded font-medium ${typeStyles.button}`;
      button.textContent = buttonText || 'OK';
      button.addEventListener('click', () => {
        this.close(true); // true znamená, že uživatel kliknul na tlačítko
      });
      
      buttonContainer.appendChild(button);
      alertBox.appendChild(buttonContainer);
      this.container.appendChild(alertBox);
    }
  
    private setupAutoClose(): void {
      if (this.options.duration) {
        this.timeoutId = window.setTimeout(() => {
          this.close(false); // false znamená, že vypršel čas
        }, this.options.duration);
      }
    }
  
    public close(byButton: boolean = true): void {
      if (!this.isVisible) return;
      
      this.isVisible = false;
      
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      
      // Animace pro odchod
      const alertBox = this.container.firstChild as HTMLElement;
      alertBox.style.animation = 'fadeOut 0.3s ease-out';
      
      // Počkat na dokončení animace před odebráním z DOM
      setTimeout(() => {
        document.body.removeChild(this.container);
        
        // Zavolat callback, pokud existuje
        if (this.options.onClose) {
          this.options.onClose();
        }
  
        // Vyřešit promise (pokud existuje)
        if (this.resolvePromise) {
          this.resolvePromise(byButton);
        }
      }, 200);
    }
  
    public waitForResponse(): Promise<boolean> {
      return new Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    }
  }
  
  /**
   * Zobrazí vlastní stylovaný alert a vrátí promise, který je vyřešen po uzavření
   * @returns Promise<boolean> - true pokud uživatel kliknul na tlačítko, false pokud vypršel čas
   */
  export async function showAlert(options: CustomAlertOptions): Promise<boolean> {
    const alert = new CustomAlert(options);
    return alert.waitForResponse();
  }

  // Příklad použití:

// await showAlert({
//     title: "Informace",
//     message: "Vaše změny byly uloženy."
//   });
  
//   // Upozornění ve středu obrazovky
//   await showAlert({
//     title: "Důležité!",
//     message: "Je třeba aktualizovat prohlížeč.",
//     type: "warning",
//     position: "center"
//   });
  
//   // Chybová hláška v levém dolním rohu s vlastním časovým limitem
//   const userResponse = await showAlert({
//     title: "Chyba při ukládání",
//     message: "Zkontrolujte připojení k internetu a zkuste to znovu.",
//     type: "error",
//     position: "bottom-left",
//     duration: 8000
//   });
  
//   if (userResponse) {
//     console.log("Uživatel potvrdil přečtení chybové hlášky");
//   } else {
//     console.log("Uživatel nereagoval, hláška zmizela automaticky");
//   }
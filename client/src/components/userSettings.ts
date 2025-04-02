import { fetchUserInfo } from "./userInfo.js";
import { renderUser } from "./renderUser.js";
import { cleanDataAndReload } from "../auth.js";

// Definice typů pro formulářová data
interface SettingsFormData {
    avatar: File | null;
    username: string;
    email: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  // Definice typů pro API response
  interface ApiResponse {
    success: boolean;
    message: string;
  }
  
  /**
   * Funkce pro vytvoření a zobrazení dialogového okna s nastavením uživatele
   */
  export function createSettingsDialog(): void {
    // Vytvoření elementu pro dialogové okno bez překrytí celého okna
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 z-50 min-w-[400px] p-4';
    
    // Vytvoření dialogového okna
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-300 max-h-[100vh] flex flex-col';
    
    // Vytvoření hlavičky s možností zavření křížkem
    const header = document.createElement('div');
    header.className = 'bg-gray-800 px-6 py-4 border-b border-gray-500 flex justify-center items-center sticky top-0 z-10';
    
    const title = document.createElement('h2');
    title.className = 'text-xl font-semibold text-gray-100';
    title.textContent = 'Profile settings';
    
    header.appendChild(title);
    //header.appendChild(closeButton);
    
    // Vytvoření formuláře
    const form = document.createElement('form');
    form.className = 'p-6 space-y-6 overflow-y-auto flex-1';
    
    // Stav formuláře
    const formData: SettingsFormData = {
      avatar: null,
      username: '',
      email: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    // Proměnná pro sledování změn v jednotlivých částech
    const formChanged = {
      avatar: false,
      profile: false,
      password: false
    };
    
    // 1. část - Avatar upload
    const avatarSection = document.createElement('div');
    avatarSection.className = 'space-y-4 text-center';
    
    const avatarTitle = document.createElement('h3');
    avatarTitle.className = 'text-lg font-medium text-gray-700';
    avatarTitle.textContent = 'AVATAR';
    
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'flex items-center justify-around space-x-4';
    
    const avatarPreview = document.createElement('div');
    avatarPreview.className = 'w-24 h-24 border border-gray-300 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden';
    
    // Placeholder pro avatar
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const avatarImage = document.createElement('img');
    avatarImage.className = 'w-full h-full object-cover';
    //TODO Opravit odkaz na defaultniho avatara + pridat relevantni obrazek, tento nema prava !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    avatarImage.src = user.avatar ?? 'http://localhost/images/avatar.png';
    avatarImage.alt = 'profile picture';
    
    avatarPreview.appendChild(avatarImage);
    
    const avatarUploadContainer = document.createElement('div');
    avatarUploadContainer.className = 'flex flex-col';
    
    const avatarInput = document.createElement('input');
    avatarInput.type = 'file';
    avatarInput.id = 'avatar';
    avatarInput.accept = 'image/*';
    avatarInput.className = 'hidden';
    
    const avatarLabel = document.createElement('label');
    avatarLabel.htmlFor = 'avatar';
    avatarLabel.className = 'bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded cursor-pointer inline-block';
    avatarLabel.textContent = 'Choose image';
    
    const avatarHelp = document.createElement('p');
    avatarHelp.className = 'text-sm text-gray-500 mt-1';
    avatarHelp.textContent = 'Max. size: 500 kB';
    
    avatarUploadContainer.appendChild(avatarLabel);
    avatarUploadContainer.appendChild(avatarInput);
    avatarUploadContainer.appendChild(avatarHelp);
    
    avatarContainer.appendChild(avatarPreview);
    avatarContainer.appendChild(avatarUploadContainer);
    
    avatarSection.appendChild(avatarTitle);
    avatarSection.appendChild(avatarContainer);
    
    // Event listener pro nahrání avataru
    avatarInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        
        // Kontrola velikosti souboru (500kB = 512000 bajtů)
        if (file.size > 512000) {
          showError('Maximum file size is 500 kB.');
          target.value = '';
          return;
        }
        
        // Kontrola, zda se jedná o obrázek
        if (!file.type.startsWith('image/')) {
          showError('The uploaded file is not an image.');
          target.value = '';
          return;
        }
        
        // Nastavení náhledu
        avatarImage.src = URL.createObjectURL(file);
        formData.avatar = file;
        formChanged.avatar = true;
      }
    });
    
    // 2. část - Uživatelské údaje
    const profileSection = document.createElement('div');
    profileSection.className = 'space-y-4';
    
    const profileTitle = document.createElement('h3');
    profileTitle.className = 'text-lg font-medium text-gray-700 text-center';
    profileTitle.textContent = 'USER INFORMATION CHANGE';
    
    // Uživatelské jméno
    const usernameGroup = document.createElement('div');
    usernameGroup.className = 'space-y-1';
    
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.placeholder = 'Username    at least 4 characters';
    usernameInput.minLength = 4;
    usernameInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
    usernameInput.value = formData.username;
    
    const usernameLabel = document.createElement('label');
    usernameLabel.htmlFor = 'username';
    usernameLabel.className = 'block text-sm font-medium text-gray-700';
    usernameLabel.textContent = 'Username';
    
    usernameGroup.appendChild(usernameLabel);
    usernameGroup.appendChild(usernameInput);
    
    // Email
    const emailGroup = document.createElement('div');
    emailGroup.className = 'space-y-1';
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'email';
    emailInput.placeholder = 'Email';
    emailInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
    emailInput.value = formData.email;
    
    const emailLabel = document.createElement('label');
    emailLabel.htmlFor = 'email';
    emailLabel.className = 'block text-sm font-medium text-gray-700';
    emailLabel.textContent = 'Email';
    
    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);
    
    profileSection.appendChild(profileTitle);
    profileSection.appendChild(usernameGroup);
    profileSection.appendChild(emailGroup);
    
    // Event listenery pro sledování změn v profileSection
    usernameInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      formData.username = target.value;
      formChanged.profile = true;
    });
    
    emailInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      formData.email = target.value;
      formChanged.profile = true;
    });
    
    // 3. část - Změna hesla
    const passwordSection = document.createElement('div');
    passwordSection.className = 'space-y-4';
    
    const passwordTitle = document.createElement('h3');
    passwordTitle.className = 'text-lg text-center font-medium text-gray-700 whitespace-pre-line';
    const sectionName = "PASSWORD CHANGE";
    const sectionWarning = "After changing the password \r\n you will be logged out and need to log in again.";
    passwordTitle.innerHTML = sectionName + "\r\n\n" +`<span class="text-red-800 text-center">` + sectionWarning + `</span>`;
    
    // Původní heslo
    const oldPasswordGroup = document.createElement('div');
    oldPasswordGroup.className = 'space-y-1';
    
    const oldPasswordInput = document.createElement('input');
    oldPasswordInput.type = 'password';
    oldPasswordInput.id = 'oldPassword';
    oldPasswordInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
    
    const oldPasswordLabel = document.createElement('label');
    oldPasswordLabel.htmlFor = 'oldPassword';
    oldPasswordLabel.className = 'block text-sm font-medium text-gray-700';
    oldPasswordLabel.textContent = 'Current password';
    
    oldPasswordGroup.appendChild(oldPasswordLabel);
    oldPasswordGroup.appendChild(oldPasswordInput);
    
    // Nové heslo
    const newPasswordGroup = document.createElement('div');
    newPasswordGroup.className = 'space-y-1';
    
    const newPasswordLabel = document.createElement('label');
    newPasswordLabel.htmlFor = 'newPassword';
    newPasswordLabel.className = 'block text-sm font-medium text-gray-700';
    newPasswordLabel.textContent = 'New password';
    
    const newPasswordInput = document.createElement('input');
    newPasswordInput.type = 'password';
    newPasswordInput.id = 'newPassword';
    newPasswordInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
    
    newPasswordGroup.appendChild(newPasswordLabel);
    newPasswordGroup.appendChild(newPasswordInput);
    
    // Potvrzení nového hesla
    const confirmPasswordGroup = document.createElement('div');
    confirmPasswordGroup.className = 'space-y-1';
    
    const confirmPasswordLabel = document.createElement('label');
    confirmPasswordLabel.htmlFor = 'confirmPassword';
    confirmPasswordLabel.className = 'block text-sm font-medium text-gray-700';
    confirmPasswordLabel.textContent = 'Confirm new password';
    
    const confirmPasswordInput = document.createElement('input');
    confirmPasswordInput.type = 'password';
    confirmPasswordInput.id = 'confirmPassword';
    confirmPasswordInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
    
    confirmPasswordGroup.appendChild(confirmPasswordLabel);
    confirmPasswordGroup.appendChild(confirmPasswordInput);
    
    passwordSection.appendChild(passwordTitle);
    passwordSection.appendChild(oldPasswordGroup);
    passwordSection.appendChild(newPasswordGroup);
    passwordSection.appendChild(confirmPasswordGroup);
    
    // Event listenery pro sledování změn v passwordSection
    oldPasswordInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      formData.oldPassword = target.value.trim();
      formChanged.password = true;
    });
    
    newPasswordInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      formData.newPassword = target.value.trim();
      formChanged.password = true;
    });
    
    confirmPasswordInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      formData.confirmPassword = target.value.trim();
      formChanged.password = true;
    });
    
    // Přidání všech sekcí do formuláře
    form.appendChild(avatarSection);
    
    const divider1 = document.createElement('hr');
    divider1.className = 'border-gray-200';
    form.appendChild(divider1);
    
    form.appendChild(profileSection);
    
    const divider2 = document.createElement('hr');
    divider2.className = 'border-gray-200';
    form.appendChild(divider2);
    
    form.appendChild(passwordSection);
    
    // Tlačítka pro akci
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'bg-gray-50 px-6 py-4 flex justify-around sticky bottom-0 z-10';
    
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500';
    cancelButton.textContent = 'Cancel';
    
    const confirmButton = document.createElement('button');
    confirmButton.type = 'button'; // Změněno z 'submit' na 'button'
    confirmButton.className = 'px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    confirmButton.textContent = 'Confirm';
    
    const deleteUserButton = document.createElement('button');
    deleteUserButton.type = 'button';
    deleteUserButton.className = 'px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500';
    deleteUserButton.textContent = 'Delete account';

    buttonContainer.appendChild(deleteUserButton);
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    
    // Funkce pro zobrazení chybové zprávy
    let errorToast: HTMLDivElement | null = null;
    
    function showError(message: string): void {
      // Pokud již existuje toast, odstraníme ho
      if (errorToast) {
        document.body.removeChild(errorToast);
      }
      
      // Vytvoření nového toastu
      errorToast = document.createElement('div');
      errorToast.className = 'fixed top-1/3 left-1/3 bg-red-500 text-white px-4 py-8 text-lg font-bold rounded-md shadow-lg z-50 min-w-[300px] min-h-[100px] text-center';
      errorToast.textContent = message;
      
      document.body.appendChild(errorToast);
      
      // Automatické odstranění po 3 sekundách
      setTimeout(() => {
        if (errorToast && document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
          errorToast = null;
        }
      }, 3000);
    }
    
    // Validace vstupu
    function validateInput(): boolean {
      // Kontrola uživatelského jména
      if (formChanged.profile && formData.username) {
        // Povolené znaky: písmena, čísla, podtržítko a pomlčka
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(formData.username)) {
          showError('The username contains illegal characters. Letters, numbers, underscores, and hyphens are allowed.');
          return false;
        }
        if(formData.username.length < 4){
          showError('Username needs to be at least 4 characters long.');
          return false;
        } 
      }
      
      // Kontrola emailu
      if (formChanged.profile && formData.email) {
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(formData.email)) {
          showError('Invalid email format.');
          return false;
        }
      }
      
      // Kontrola hesel
      if (formChanged.password) {
        // Kontrola, zda bylo zadáno původní heslo......................................................................Doplnit pristup ke staremu heslu a jeho kontrolu
        if (!formData.oldPassword) {
          showError('Enter your current password.');
          return false;
        }
        
        // Kontrola, zda byla zadána obě nová hesla
        if (!formData.newPassword || !formData.confirmPassword) {
          showError('Enter a new password and confirm it.');
          return false;
        }
        
        // Kontrola, zda se nová hesla shodují
        if (formData.newPassword !== formData.confirmPassword) {
          showError('The new passwords do not match.');
          return false;
        }
        
        // Kontrola složitosti hesla
        //const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; ..................................................................
        const passwordRegex = /^(?=.*[a-z])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.newPassword)) {
          showError('The password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.');
          return false;
        }
      }
      
      return true;
    }
    
    // Odeslání formuláře
    async function submitForm(): Promise<void> {
      if (!validateInput()) {
        return;
      }
      
      try {
        // Kontrola, zda byly provedeny nějaké změny
        if (!formChanged.avatar && !formChanged.profile && !formChanged.password) {
          closeDialog();
          return;
        }
        
        // 1. Nahrání avataru
        if (formChanged.avatar && formData.avatar) {
          const formDataAvatar = new FormData();
          console.log(formData.avatar);
          formDataAvatar.append('upload', formData.avatar);
          console.log(`zkousim poslat avatara: ${formDataAvatar}`);
          
          const avatarResponse = await fetch('http://localhost/api/upload/avatar', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            },
            body:formDataAvatar
          });
          console.log(`avatar response - status: ${avatarResponse.status} + statusText: ${avatarResponse.statusText} + avatarResponse.ok: ${avatarResponse.ok}`);
          const avatarResult = await avatarResponse.json();
          console.log(`avatar result status: ${avatarResult.status}`);
          console.log(`avatar result message: ${avatarResult.message}`);
          if (avatarResult.status !== "success") {
            showError(`Error uploading avatar: ${avatarResult.message}`);
            return;
          }
          else {
            console.log(`Uploading an avatar should be ok: ${avatarResult.message}`);
            await fetchUserInfo();
            renderUser();
          }
        }
        
        // 2. Aktualizace uživatelských údajů
        if (formChanged.profile) {
          //console.log(`zkousim poslat profil: ${formData.username} a email: ${formData.email}`);
          const requestData: { username?: string; email?: string } = {};
          if (formData.username.length > 0) {
            requestData.username = formData.username;
          }
          if (formData.email.length > 0) {
            requestData.email = formData.email;
          }
          const requestOptions = {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
          };
          
          console.log(requestOptions);
          const profileResponse = await fetch('http://localhost/api/auth/user', requestOptions);
          console.log(`profil response - status: ${profileResponse.status} + statusText: ${profileResponse.statusText} + profileResponse.ok: ${profileResponse.ok}`);
          if(profileResponse.status === 409){
            showError(`The username or email already exists.`);
            return;
          }
          else if (!profileResponse.ok) {
            showError(`Error updating profile: ${profileResponse.statusText}`);
            return;
          }
          else{
            await fetchUserInfo();
            renderUser();
          }
        }
        
        // 3. Změna hesla
        if (formChanged.password) {
          console.log(`zkousim poslat heslo: ${formData.oldPassword} a nove heslo: ${formData.newPassword}`);
          const passwordResponse = await fetch('http://localhost/api/auth/user/password', {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              "password": formData.oldPassword,
              "newPassword": formData.newPassword
            })
          });
          const passwordResult: ApiResponse = await passwordResponse.json();
          console.log(`password response - status: ${passwordResponse.status} + statusText: ${passwordResponse.statusText} + passwordResponse.ok: ${passwordResponse.ok}`);
          if (!passwordResponse.ok) {
            showError(`Error password change:  ${passwordResult.message}`);
            return;
          }
          else{
            console.log(`Password change should be ok: ${passwordResult.message}`);
          }
        }
        
        // Zavření dialogu po úspěšném odeslání
        closeDialog();
        
        // Oznámení úspěchu
        const successToast = document.createElement('div');
        successToast.className = 'fixed top-1/3 left-1/3 bg-green-500 text-white px-4 py-8 text-lg font-bold rounded-md shadow-lg z-50 min-w-[300px] min-h-[100px] text-center';
        successToast.textContent = 'Changes saved successfully.';
        
        document.body.appendChild(successToast);
        
        setTimeout(() => {
          if (document.body.contains(successToast)) {
            document.body.removeChild(successToast);
          }
          if(formChanged.password){
            cleanDataAndReload();
          }
        }, 3000);
        
        // Přidání logu pro sledování průběhu
        console.log('The form was successfully submitted:', {
          avatarChanged: formChanged.avatar,
          profileChanged: formChanged.profile,
          passwordChanged: formChanged.password
        });
        
      } catch (error) {
        console.error('Error submitting form:', error);
        showError('An unexpected error occurred while saving changes.');
      }
    }
    
    // Funkce pro zavření dialogu
    function closeDialog(): void {
      if (document.body.contains(modalOverlay)) {
        document.body.removeChild(modalOverlay);
      }
    }
    
    // Event listenery pro tlačítka
    cancelButton.addEventListener('click', closeDialog);

    deleteUserButton.addEventListener('click', async () => {
      const result = confirm('Are you sure you want to delete your account?');
      if (result) {
        try {
          const response = await fetch('http://localhost/api/auth/user', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            }
          }); 
          const data = await response.json();
          console.log(`delete user response: ${response.status}`);
          window.alert(`deleting user: ${data.message}`);
          if (!response.ok) {
            showError(`Error deleting the account: ${data.message}`);
            return;
          }
          else {
            cleanDataAndReload();
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          showError('An unexpected error occurred while deleting the account.');
        }
      }
    });
    
    // Přímé připojení event listeneru k tlačítku Potvrdit
    confirmButton.addEventListener('click', (e) => {
      e.preventDefault();
      submitForm();
    });
    
    // Sestavení a zobrazení modálního okna
    modalContent.appendChild(header);
    modalContent.appendChild(form);
    modalContent.appendChild(buttonContainer);
    modalOverlay.appendChild(modalContent);
    
    document.body.appendChild(modalOverlay);
    
    // Odstraníme event listener pro zavření po kliknutí mimo dialog, 
    // protože nyní není potřeba (nemáme overlay)
    
    // Event listener pro zavření pomocí klávesy Escape
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.body.contains(modalOverlay)) {
        closeDialog();
      }
    });
  }

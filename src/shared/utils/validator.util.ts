type PasswordRuleFlags = {
  hasNumber: boolean;
  hasLowerCaseLetter: boolean;
  hasUpperCaseLetter: boolean;
  hasSpecialCharacter: boolean;
  lengthIsValid: boolean;
};
  
interface IValidator {
  validatePasswordBoolean(password: string): boolean;
  validatePasswordFlags(password: string): PasswordRuleFlags;
  validateEmail(email: string): boolean;
  validateUrl(url: string): boolean;
}
  
class Validator implements IValidator {
  private passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\_\-\+])(?=.{8,})/;
  private emailRegex: RegExp = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  private urlRegex: RegExp = /[-a-zA-Z0-9@:%_\+.~#?&\/=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&\/=]*)?/gi;

  public validatePasswordBoolean(password: string): boolean {
    return this.passwordRegex.test(password);
  }

  public validatePasswordFlags(password: string): PasswordRuleFlags {
    const ruleFlags: PasswordRuleFlags = {
      hasNumber: /[0-9]/.test(password),
      hasLowerCaseLetter: /[a-z]/.test(password),
      hasUpperCaseLetter: /[A-Z]/.test(password),
      hasSpecialCharacter: /[!@#\$%\^&\*\_\-\+]/.test(password),
      lengthIsValid: password.length > 7,
    };
  
    return ruleFlags;
  }

  public validateEmail(email: string): boolean {
    return this.emailRegex.test(email);
  }

  public validateUrl(url: string): boolean {
    return this.urlRegex.test(url);
  }
}

export const validator = new Validator();
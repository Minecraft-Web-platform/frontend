type PasswordRuleFlags = {
  lengthIsValid: boolean;
  allowedCharactersOnly: boolean;
};

interface IValidator {
  validatePasswordBoolean(password: string): boolean;
  validatePasswordFlags(password: string): PasswordRuleFlags;
  validatePasswordErrors(password: string): string[];
  validateEmail(email: string): boolean;
  validateUrl(url: string): boolean;
  validateUsername(username: string): boolean;
}

class Validator implements IValidator {
  private passwordRegex: RegExp = /^[A-Za-z0-9_+-]{8,}$/;
  private emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  private urlRegex: RegExp = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  private usernameRegex: RegExp = /^[A-Za-z0-9_]{3,16}$/;

  public validatePasswordBoolean(password: string): boolean {
    return this.passwordRegex.test(password);
  }

  public validatePasswordFlags(password: string): PasswordRuleFlags {
    return {
      lengthIsValid: password.length >= 8,
      allowedCharactersOnly: /^[A-Za-z0-9_+-]+$/.test(password),
    };
  }

  public validatePasswordErrors(password: string): string[] {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("Пароль должен быть не короче 8 символов");
    }
    if (!this.passwordRegex.test(password)) {
      errors.push(
        "Пароль содержит недопустимые символы (разрешены только латиница, цифры, _ + -)"
      );
    }
    return errors;
  }

  public validateUsernameErrors(username: string): string[] {
    const errors: string[] = [];
    if (username.length < 3 || username.length > 16) {
      errors.push("Никнейм должен быть от 3 до 16 символов");
    }
    if (!this.usernameRegex.test(username)) {
      errors.push(
        "Никнейм содержит недопустимые символы (разрешены только латиница, цифры и _)"
      );
    }
    return errors;
  }

  public validateEmail(email: string): boolean {
    return this.emailRegex.test(email);
  }

  public validateUrl(url: string): boolean {
    return this.urlRegex.test(url);
  }

  public validateUsername(username: string): boolean {
    return this.usernameRegex.test(username);
  }
}

export const validator = new Validator();

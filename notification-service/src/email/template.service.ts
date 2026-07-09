// src/email/template.service.ts
import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import * as Handlebars from "handlebars";

export enum Template {
  RESET_PASSWORD = "reset-password",
  VERIFY_EMAIL = "verify-email",
  WELCOM = "welcome",
}

@Injectable()
export class TemplateService {
  private templatesDir = path.join(__dirname, "templates");
  private logger= new Logger(TemplateService.name);

  compileTemplate(templateName: Template, context: any): string {
    const filePath = path.join(this.templatesDir, `${templateName}.hbs`);
    const templateFile = fs.readFileSync(filePath, "utf8");
    const template = Handlebars.compile(templateFile);
    this.logger.debug(context);
    return template(context);
  }
}

import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum FileAccessLevel {
  PUBLIC = "PUBLIC",
  PROTECTED = "PROTECTED",
  PRIVATE = "PRIVATE"
}

export enum OrganisationRoleEnum {
  NO_ACCESS = "NO_ACCESS",
  VIEWING_ACCESS = "VIEWING_ACCESS",
  CREATING_ACCESS = "CREATING_ACCESS"
}

export enum InputFieldTypeEnum {
  COMPANY = "COMPANY",
  PERSON = "PERSON",
  BOOLEAN = "BOOLEAN",
  ONE_LINE_TEXT = "ONE_LINE_TEXT",
  MULTI_LINE_TEXT = "MULTI_LINE_TEXT",
  NUMBER = "NUMBER",
  PHONE = "PHONE",
  AWS_DATE = "AWSDate",
  TIME = "TIME",
  LIST = "LIST",
  COMBINED_LIST = "COMBINED_LIST"
}

export enum ContractStatus {
  FILLING = "FILLING",
  EDITING = "EDITING",
  SIGNING = "SIGNING",
  SIGNED = "SIGNED",
  REJECTED = "REJECTED"
}

export enum InstanceRoleEnum {
  NO_ACCESS = "NO_ACCESS",
  READ_ACCESS = "READ_ACCESS",
  WRITE_ACCESS = "WRITE_ACCESS",
  ADMIN_ACCESS = "ADMIN_ACCESS"
}

export declare class File {
  readonly key: string;
  readonly level: FileAccessLevel | keyof typeof FileAccessLevel;
  constructor(init: ModelInit<File>);
}

export declare class Address {
  readonly address?: string;
  readonly city?: string;
  readonly postcode?: string;
  readonly country?: string;
  constructor(init: ModelInit<Address>);
}

export declare class TemplateSection {
  readonly sectionID: string;
  readonly subSections: TemplateSection[];
  constructor(init: ModelInit<TemplateSection>);
}

export declare class User {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly avatar?: File;
  readonly address?: Address;
  readonly phoneNumber?: string;
  constructor(init: ModelInit<User>);
  static copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

export declare class Team {
  readonly id: string;
  readonly name: string;
  constructor(init: ModelInit<Team>);
  static copyOf(source: Team, mutator: (draft: MutableModel<Team>) => MutableModel<Team> | void): Team;
}

export declare class Organisation {
  readonly id: string;
  readonly name: string;
  readonly address?: Address;
  constructor(init: ModelInit<Organisation>);
  static copyOf(source: Organisation, mutator: (draft: MutableModel<Organisation>) => MutableModel<Organisation> | void): Organisation;
}

export declare class OrganisationRole {
  readonly id: string;
  readonly entityID: string;
  readonly organisationID: string;
  readonly templateRole: OrganisationRoleEnum | keyof typeof OrganisationRoleEnum;
  readonly contractRole: OrganisationRoleEnum | keyof typeof OrganisationRoleEnum;
  readonly isManager?: boolean;
  constructor(init: ModelInit<OrganisationRole>);
  static copyOf(source: OrganisationRole, mutator: (draft: MutableModel<OrganisationRole>) => MutableModel<OrganisationRole> | void): OrganisationRole;
}

export declare class InputField {
  readonly id: string;
  readonly organisationID: string;
  readonly type: InputFieldTypeEnum | keyof typeof InputFieldTypeEnum;
  readonly name: string;
  readonly question: string;
  readonly values?: string;
  readonly text?: string;
  readonly baseListID?: string;
  readonly tags: string[];
  constructor(init: ModelInit<InputField>);
  static copyOf(source: InputField, mutator: (draft: MutableModel<InputField>) => MutableModel<InputField> | void): InputField;
}

export declare class Conditional {
  readonly id: string;
  readonly organisationID: string;
  readonly fieldID: string;
  readonly values: string;
  readonly tags: string[];
  constructor(init: ModelInit<Conditional>);
  static copyOf(source: Conditional, mutator: (draft: MutableModel<Conditional>) => MutableModel<Conditional> | void): Conditional;
}

export declare class SectionDelta {
  readonly id: string;
  readonly sectionID: string;
  readonly operation: string;
  readonly comment?: string;
  readonly changedBy: string;
  readonly acceptedBy?: string;
  readonly acceptedAWSDate?: string;
  constructor(init: ModelInit<SectionDelta>);
  static copyOf(source: SectionDelta, mutator: (draft: MutableModel<SectionDelta>) => MutableModel<SectionDelta> | void): SectionDelta;
}

export declare class SectionText {
  readonly id: string;
  readonly organisationID: string;
  readonly text: string;
  readonly fields: string;
  readonly conditionals: string;
  readonly references: string;
  readonly tags: string[];
  constructor(init: ModelInit<SectionText>);
  static copyOf(source: SectionText, mutator: (draft: MutableModel<SectionText>) => MutableModel<SectionText> | void): SectionText;
}

export declare class SectionFile {
  readonly id: string;
  readonly organisationID: string;
  readonly file: File;
  readonly tags: string[];
  constructor(init: ModelInit<SectionFile>);
  static copyOf(source: SectionFile, mutator: (draft: MutableModel<SectionFile>) => MutableModel<SectionFile> | void): SectionFile;
}

export declare class Template {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly header?: string;
  readonly sections: TemplateSection[];
  readonly footer?: string;
  readonly annexes: TemplateSection[];
  constructor(init: ModelInit<Template>);
  static copyOf(source: Template, mutator: (draft: MutableModel<Template>) => MutableModel<Template> | void): Template;
}

export declare class Contract {
  readonly id: string;
  readonly name: string;
  readonly status: ContractStatus | keyof typeof ContractStatus;
  readonly fieldsResponses: string;
  readonly additionalDocuments: File[];
  constructor(init: ModelInit<Contract>);
  static copyOf(source: Contract, mutator: (draft: MutableModel<Contract>) => MutableModel<Contract> | void): Contract;
}

export declare class InstanceRole {
  readonly id: string;
  readonly instanceID: string;
  readonly entityID: string;
  readonly organisationID?: string;
  readonly role: InstanceRoleEnum | keyof typeof InstanceRoleEnum;
  constructor(init: ModelInit<InstanceRole>);
  static copyOf(source: InstanceRole, mutator: (draft: MutableModel<InstanceRole>) => MutableModel<InstanceRole> | void): InstanceRole;
}

export declare class Comment {
  readonly id: string;
  readonly userID: string;
  readonly instanceID: string;
  readonly organisationID?: string;
  readonly text: string;
  constructor(init: ModelInit<Comment>);
  static copyOf(source: Comment, mutator: (draft: MutableModel<Comment>) => MutableModel<Comment> | void): Comment;
}
// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const FileAccessLevel = {
  "PUBLIC": "PUBLIC",
  "PROTECTED": "PROTECTED",
  "PRIVATE": "PRIVATE"
};

const OrganisationRoleEnum = {
  "NO_ACCESS": "NO_ACCESS",
  "VIEWING_ACCESS": "VIEWING_ACCESS",
  "CREATING_ACCESS": "CREATING_ACCESS"
};

const InputFieldTypeEnum = {
  "COMPANY": "COMPANY",
  "PERSON": "PERSON",
  "BOOLEAN": "BOOLEAN",
  "ONE_LINE_TEXT": "ONE_LINE_TEXT",
  "MULTI_LINE_TEXT": "MULTI_LINE_TEXT",
  "NUMBER": "NUMBER",
  "PHONE": "PHONE",
  "AWS_DATE": "AWSDate",
  "TIME": "TIME",
  "LIST": "LIST",
  "COMBINED_LIST": "COMBINED_LIST"
};

const ContractStatus = {
  "FILLING": "FILLING",
  "EDITING": "EDITING",
  "SIGNING": "SIGNING",
  "SIGNED": "SIGNED",
  "REJECTED": "REJECTED"
};

const InstanceRoleEnum = {
  "NO_ACCESS": "NO_ACCESS",
  "READ_ACCESS": "READ_ACCESS",
  "WRITE_ACCESS": "WRITE_ACCESS",
  "ADMIN_ACCESS": "ADMIN_ACCESS"
};

const { User, Team, Organisation, OrganisationRole, InputField, Conditional, SectionDelta, SectionText, SectionFile, Template, Contract, InstanceRole, Comment, File, Address, TemplateSection } = initSchema(schema);

export {
  User,
  Team,
  Organisation,
  OrganisationRole,
  InputField,
  Conditional,
  SectionDelta,
  SectionText,
  SectionFile,
  Template,
  Contract,
  InstanceRole,
  Comment,
  FileAccessLevel,
  OrganisationRoleEnum,
  InputFieldTypeEnum,
  ContractStatus,
  InstanceRoleEnum,
  File,
  Address,
  TemplateSection
};
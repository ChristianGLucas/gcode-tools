// package: christiangeorgelucas.gcode_tools
// file: messages.proto

import * as jspb from "google-protobuf";

export class GcodeInput extends jspb.Message {
  getContent(): string;
  setContent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GcodeInput.AsObject;
  static toObject(includeInstance: boolean, msg: GcodeInput): GcodeInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GcodeInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GcodeInput;
  static deserializeBinaryFromReader(message: GcodeInput, reader: jspb.BinaryReader): GcodeInput;
}

export namespace GcodeInput {
  export type AsObject = {
    content: string,
  }
}

export class Point3 extends jspb.Message {
  getX(): number;
  setX(value: number): void;

  getY(): number;
  setY(value: number): void;

  getZ(): number;
  setZ(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Point3.AsObject;
  static toObject(includeInstance: boolean, msg: Point3): Point3.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Point3, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Point3;
  static deserializeBinaryFromReader(message: Point3, reader: jspb.BinaryReader): Point3;
}

export namespace Point3 {
  export type AsObject = {
    x: number,
    y: number,
    z: number,
  }
}

export class GcodeWord extends jspb.Message {
  getLetter(): string;
  setLetter(value: string): void;

  getValue(): number;
  setValue(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GcodeWord.AsObject;
  static toObject(includeInstance: boolean, msg: GcodeWord): GcodeWord.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GcodeWord, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GcodeWord;
  static deserializeBinaryFromReader(message: GcodeWord, reader: jspb.BinaryReader): GcodeWord;
}

export namespace GcodeWord {
  export type AsObject = {
    letter: string,
    value: number,
  }
}

export class GcodeLine extends jspb.Message {
  getLineNumber(): number;
  setLineNumber(value: number): void;

  clearWordsList(): void;
  getWordsList(): Array<GcodeWord>;
  setWordsList(value: Array<GcodeWord>): void;
  addWords(value?: GcodeWord, index?: number): GcodeWord;

  getComment(): string;
  setComment(value: string): void;

  getRaw(): string;
  setRaw(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GcodeLine.AsObject;
  static toObject(includeInstance: boolean, msg: GcodeLine): GcodeLine.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GcodeLine, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GcodeLine;
  static deserializeBinaryFromReader(message: GcodeLine, reader: jspb.BinaryReader): GcodeLine;
}

export namespace GcodeLine {
  export type AsObject = {
    lineNumber: number,
    wordsList: Array<GcodeWord.AsObject>,
    comment: string,
    raw: string,
  }
}

export class ParsedGcode extends jspb.Message {
  clearLinesList(): void;
  getLinesList(): Array<GcodeLine>;
  setLinesList(value: Array<GcodeLine>): void;
  addLines(value?: GcodeLine, index?: number): GcodeLine;

  getLineCount(): number;
  setLineCount(value: number): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParsedGcode.AsObject;
  static toObject(includeInstance: boolean, msg: ParsedGcode): ParsedGcode.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParsedGcode, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParsedGcode;
  static deserializeBinaryFromReader(message: ParsedGcode, reader: jspb.BinaryReader): ParsedGcode;
}

export namespace ParsedGcode {
  export type AsObject = {
    linesList: Array<GcodeLine.AsObject>,
    lineCount: number,
    error: string,
  }
}

export class ValidationIssue extends jspb.Message {
  getLine(): number;
  setLine(value: number): void;

  getSeverity(): string;
  setSeverity(value: string): void;

  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidationIssue.AsObject;
  static toObject(includeInstance: boolean, msg: ValidationIssue): ValidationIssue.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidationIssue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidationIssue;
  static deserializeBinaryFromReader(message: ValidationIssue, reader: jspb.BinaryReader): ValidationIssue;
}

export namespace ValidationIssue {
  export type AsObject = {
    line: number,
    severity: string,
    message: string,
  }
}

export class ValidationResult extends jspb.Message {
  getValid(): boolean;
  setValid(value: boolean): void;

  clearIssuesList(): void;
  getIssuesList(): Array<ValidationIssue>;
  setIssuesList(value: Array<ValidationIssue>): void;
  addIssues(value?: ValidationIssue, index?: number): ValidationIssue;

  getLineCount(): number;
  setLineCount(value: number): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidationResult.AsObject;
  static toObject(includeInstance: boolean, msg: ValidationResult): ValidationResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidationResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidationResult;
  static deserializeBinaryFromReader(message: ValidationResult, reader: jspb.BinaryReader): ValidationResult;
}

export namespace ValidationResult {
  export type AsObject = {
    valid: boolean,
    issuesList: Array<ValidationIssue.AsObject>,
    lineCount: number,
    error: string,
  }
}

export class ComputeToolpathMetricsInput extends jspb.Message {
  getContent(): string;
  setContent(value: string): void;

  getRapidFeedrate(): number;
  setRapidFeedrate(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ComputeToolpathMetricsInput.AsObject;
  static toObject(includeInstance: boolean, msg: ComputeToolpathMetricsInput): ComputeToolpathMetricsInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ComputeToolpathMetricsInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ComputeToolpathMetricsInput;
  static deserializeBinaryFromReader(message: ComputeToolpathMetricsInput, reader: jspb.BinaryReader): ComputeToolpathMetricsInput;
}

export namespace ComputeToolpathMetricsInput {
  export type AsObject = {
    content: string,
    rapidFeedrate: number,
  }
}

export class BoundingBox extends jspb.Message {
  hasMin(): boolean;
  clearMin(): void;
  getMin(): Point3 | undefined;
  setMin(value?: Point3): void;

  hasMax(): boolean;
  clearMax(): void;
  getMax(): Point3 | undefined;
  setMax(value?: Point3): void;

  hasExtents(): boolean;
  clearExtents(): void;
  getExtents(): Point3 | undefined;
  setExtents(value?: Point3): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BoundingBox.AsObject;
  static toObject(includeInstance: boolean, msg: BoundingBox): BoundingBox.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BoundingBox, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BoundingBox;
  static deserializeBinaryFromReader(message: BoundingBox, reader: jspb.BinaryReader): BoundingBox;
}

export namespace BoundingBox {
  export type AsObject = {
    min?: Point3.AsObject,
    max?: Point3.AsObject,
    extents?: Point3.AsObject,
  }
}

export class ToolpathMetrics extends jspb.Message {
  hasBoundingBox(): boolean;
  clearBoundingBox(): void;
  getBoundingBox(): BoundingBox | undefined;
  setBoundingBox(value?: BoundingBox): void;

  getRapidDistance(): number;
  setRapidDistance(value: number): void;

  getCutDistance(): number;
  setCutDistance(value: number): void;

  getTotalDistance(): number;
  setTotalDistance(value: number): void;

  getEstimatedTimeSeconds(): number;
  setEstimatedTimeSeconds(value: number): void;

  getUnits(): string;
  setUnits(value: string): void;

  clearFeedRatesUsedList(): void;
  getFeedRatesUsedList(): Array<number>;
  setFeedRatesUsedList(value: Array<number>): void;
  addFeedRatesUsed(value: number, index?: number): number;

  clearSpindleSpeedsUsedList(): void;
  getSpindleSpeedsUsedList(): Array<number>;
  setSpindleSpeedsUsedList(value: Array<number>): void;
  addSpindleSpeedsUsed(value: number, index?: number): number;

  clearToolsUsedList(): void;
  getToolsUsedList(): Array<number>;
  setToolsUsedList(value: Array<number>): void;
  addToolsUsed(value: number, index?: number): number;

  getMoveCount(): number;
  setMoveCount(value: number): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ToolpathMetrics.AsObject;
  static toObject(includeInstance: boolean, msg: ToolpathMetrics): ToolpathMetrics.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ToolpathMetrics, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ToolpathMetrics;
  static deserializeBinaryFromReader(message: ToolpathMetrics, reader: jspb.BinaryReader): ToolpathMetrics;
}

export namespace ToolpathMetrics {
  export type AsObject = {
    boundingBox?: BoundingBox.AsObject,
    rapidDistance: number,
    cutDistance: number,
    totalDistance: number,
    estimatedTimeSeconds: number,
    units: string,
    feedRatesUsedList: Array<number>,
    spindleSpeedsUsedList: Array<number>,
    toolsUsedList: Array<number>,
    moveCount: number,
    error: string,
  }
}

export class CommandCount extends jspb.Message {
  getCode(): string;
  setCode(value: string): void;

  getCount(): number;
  setCount(value: number): void;

  clearLinesList(): void;
  getLinesList(): Array<number>;
  setLinesList(value: Array<number>): void;
  addLines(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommandCount.AsObject;
  static toObject(includeInstance: boolean, msg: CommandCount): CommandCount.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommandCount, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommandCount;
  static deserializeBinaryFromReader(message: CommandCount, reader: jspb.BinaryReader): CommandCount;
}

export namespace CommandCount {
  export type AsObject = {
    code: string,
    count: number,
    linesList: Array<number>,
  }
}

export class CommandInventory extends jspb.Message {
  clearCommandsList(): void;
  getCommandsList(): Array<CommandCount>;
  setCommandsList(value: Array<CommandCount>): void;
  addCommands(value?: CommandCount, index?: number): CommandCount;

  getTotalLines(): number;
  setTotalLines(value: number): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommandInventory.AsObject;
  static toObject(includeInstance: boolean, msg: CommandInventory): CommandInventory.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommandInventory, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommandInventory;
  static deserializeBinaryFromReader(message: CommandInventory, reader: jspb.BinaryReader): CommandInventory;
}

export namespace CommandInventory {
  export type AsObject = {
    commandsList: Array<CommandCount.AsObject>,
    totalLines: number,
    error: string,
  }
}

export class ReemitGcodeInput extends jspb.Message {
  getContent(): string;
  setContent(value: string): void;

  getLineMode(): string;
  setLineMode(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReemitGcodeInput.AsObject;
  static toObject(includeInstance: boolean, msg: ReemitGcodeInput): ReemitGcodeInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReemitGcodeInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReemitGcodeInput;
  static deserializeBinaryFromReader(message: ReemitGcodeInput, reader: jspb.BinaryReader): ReemitGcodeInput;
}

export namespace ReemitGcodeInput {
  export type AsObject = {
    content: string,
    lineMode: string,
  }
}

export class ReemitGcodeOutput extends jspb.Message {
  getContent(): string;
  setContent(value: string): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReemitGcodeOutput.AsObject;
  static toObject(includeInstance: boolean, msg: ReemitGcodeOutput): ReemitGcodeOutput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReemitGcodeOutput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReemitGcodeOutput;
  static deserializeBinaryFromReader(message: ReemitGcodeOutput, reader: jspb.BinaryReader): ReemitGcodeOutput;
}

export namespace ReemitGcodeOutput {
  export type AsObject = {
    content: string,
    error: string,
  }
}


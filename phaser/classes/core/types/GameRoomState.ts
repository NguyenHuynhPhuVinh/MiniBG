import { Schema, MapSchema, type as colyseusType } from "@colyseus/schema";

// Workaround: TypeScript sometimes can't resolve the decorator signature from
// the imported symbol. Cast to `any` and use the alias below to silence
// the type-checker while keeping runtime behavior.
const colyseusTypeAny: any = colyseusType;

// File này là bản sao của Schema trên server
export class Player extends Schema {
  @colyseusTypeAny("number") x: number = 0;
  @colyseusTypeAny("number") y: number = 0;
  @colyseusTypeAny("string") animState: string = "idle";
  @colyseusTypeAny("boolean") flipX: boolean = false;
}

export class GameRoomState extends Schema {
  @colyseusTypeAny({ map: Player }) players = new MapSchema<Player>();
}

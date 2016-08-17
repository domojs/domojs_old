declare module domojs
{
    export interface Device {
        emit(eventName:string):void;
        on(eventName:string, handler:()=>void):void;
        statusMethod?:string|number;
        status?(callback:(status:any)=>void):void;
        commands:CommandCollection;
        subdevices:DeviceCollection;
    }

    export interface DeviceCollection{
        [name:string]:Device;
    }

    export interface CommandCollection{
        [name:string]:Function|string;
    }

    export interface DeviceType
    {
        name:string,
        onChange():void,
        onAdd():void, 
        onSave(data:FormData):void;
        onServerSave(device:Device, body:any):void;
    }

    export interface DeviceTypeCollection
    {
        [name:string]:DeviceType;
    }
}
declare var deviceTypes:domojs.DeviceTypeCollection;
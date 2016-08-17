declare module domojs.core
{
    export interface Router
    {
        on(route:string, handler:(url?:string, params?:any, unchanged?:boolean)=>void);
    }
}
declare var route:domojs.core.Router;
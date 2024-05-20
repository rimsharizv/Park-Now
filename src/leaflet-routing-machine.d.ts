import * as L from 'leaflet';

declare module 'leaflet' {
    namespace Routing {
        class Control extends L.Control {
            constructor(options?: any);
            on(type: string, fn: (args: any) => void, context?: any): this;
            getPlan(): any;
            // Add any specific methods or properties you need that are part of Routing.Control
        }

        function control(options?: any): Control;
    }
}

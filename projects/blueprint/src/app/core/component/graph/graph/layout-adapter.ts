import { timer } from 'd3';
import { Layout } from 'webcola';

export class LayoutAdaptor extends Layout {
    override kick() {
        const t = timer(() => {
            return super.tick() && t.stop();
        });
    }

    constructor() {
        super();
    }
}

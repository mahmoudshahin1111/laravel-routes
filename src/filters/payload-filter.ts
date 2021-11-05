
interface Filter {
    filter(payload: string): string;
}
export class InlineCommentsFilter implements Filter {
    filter(payload: string): string {
        return payload.replace(/\s+\/\/[^\n]+/gm, '');
    }
}
export class MultiLinesCommentFilter implements Filter {
    filter(payload: string): string {
        return payload.replace(/\/\*(.|\n|\r|\s|\t)*?\*\//gm, '');
    }

}
export class SpacesFilter implements Filter {
    filter(payload: string): string {
        return payload.replace(/([\n|\s\t]+?)/gm, '');
    }

}
export class PhpTagsFilter implements Filter {
    filter(payload: string): string {
        return payload.replace(/(\<\?php|\?\>)/gm, '');
    }

}
export class PhpKeywordsFilter implements Filter {
    filter(payload: string): string {
        return payload.replace(/^\s?use(.|\n)+?;/gm, '');
    }

}
export class PayloadFilter {
    private filters: Filter[];
    constructor() {
        this.filters = [];
    }
    add(filter: Filter): PayloadFilter {
        this.filters.push(filter);
        return this;
    }
    remove(filter: Filter): PayloadFilter {
        this.filters = this.filters.filter(_filter=>_filter !== filter);
        return this;
    }
    filter(payload: string): string {
        let filteredPayload = payload;
        this.filters.forEach(filter => {
            filteredPayload = filter.filter(filteredPayload);
        });
        return filteredPayload;
    }

}
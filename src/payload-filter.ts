
interface Filter {
    filter(payload: string): string;
}
class InlineCommentsFilter implements Filter {
    filter(payload: string): string {
        return payload.replace(/\s+\/\/[^\n]+/gm, '');
    }
}
class MultiLinesCommentFilter implements Filter {
    filter(payload: string): string {
        return payload.replace(/\/\*(.|\n|\r|\s|\t)*?\*\//gm, '');
    }

}
class SpacesFilter implements Filter {
    filter(payload: string): string {
        return payload.replace(/([\n|\s\t]+?)/gm, '');
    }

}
class PhpTagsFilter implements Filter {
    filter(payload: string): string {
        return payload.replace(/(\<\?php|\?\>)/gm, '');
    }

}
class PhpKeywordsFilter implements Filter {
    filter(payload: string): string {
        return payload.replace(/^\s?use(.|\n)+?;/gm, '');
    }

}
export class PayloadFilter {
    private filters: Filter[];
    constructor() {
        this.filters = [
            new InlineCommentsFilter(),
            new MultiLinesCommentFilter(),
            new PhpKeywordsFilter(),
            new PhpTagsFilter(),
            new SpacesFilter(),

        ];
    }
    filter(payload: string): string {
        let filteredPayload = payload;
        this.filters.forEach(filter => {
            filteredPayload = filter.filter(filteredPayload);
        });
        return filteredPayload;
    }

}
import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplateCacheService {
    private readonly cache =
        new Map();

    set(
        key: string,
        value: any,
    ) {
        this.cache.set(
            key,
            value,
        );
    }

    get(
        key: string,
    ) {
        return this.cache.get(
            key,
        );
    }

    remove(
        key: string,
    ) {
        this.cache.delete(
            key,
        );
    }

    clear() {
        this.cache.clear();
    }
}
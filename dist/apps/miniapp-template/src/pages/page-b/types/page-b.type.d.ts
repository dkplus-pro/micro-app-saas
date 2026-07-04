import type { ModuleKey } from '../../../../../../packages/schema/src/types.ts';
export interface PageBModuleViewModel {
    key: ModuleKey;
    props: Record<string, unknown>;
    order: number;
}

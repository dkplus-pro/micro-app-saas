export function toVisibleModules(modules = []) {
    return modules.map((module, index) => ({
        key: module.key,
        props: module.props ?? {},
        order: index
    }));
}

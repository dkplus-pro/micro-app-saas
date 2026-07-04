export function toVisibleModules(modules = []) {
    return modules.map((module) => ({ key: module.key, props: module.props ?? {} }));
}

export default (object, attributes = []) => {
    if (!Array.isArray(attributes) || attributes.length < 1) {
        return {};
    }

    const reducer = o => (prev, key) => {
        const value = o[key];
        return value === undefined ? prev : { ...prev, [key]: value };
    };

    return attributes.reduce(reducer(object), {});
};

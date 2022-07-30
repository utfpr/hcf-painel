export const getScrollPosition = () => window.scrollY || document.documentElement.scrollTop;

export const getScrollTop = () => (document.scrollingElement || document.documentElement).scrollTop;

export const getScrollBottom = () => Math.abs(
    window.innerHeight + getScrollPosition() - document.body.scrollHeight,
);

export const getScrollPercentage = () => {
    const scrollPosition = getScrollPosition();
    const scrollHeight = document.documentElement.scrollHeight
    - document.documentElement.clientHeight;
    const scrollTop = scrollPosition / scrollHeight || 0;

    return scrollTop * 100;
};

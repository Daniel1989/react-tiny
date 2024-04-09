import { ReactElement } from "../../shared/ReactTypes";
import { mountChildFibers, reconcileChildFibers } from "./childFiber";
import { FiberNode } from "./fiber";
import { processUpdateQueue } from "./updateQueue";
import { HostComponent, HostRoot, HostText, FunctionComponent } from "./workTags";
import { renderWithHooks } from "./fiberHooks";

export const beginWork = (workInProgress: FiberNode) => {
    console.log("progress", workInProgress.tag)
    switch(workInProgress.tag) {
        case HostRoot:
            return updateHostRoot(workInProgress);
        case HostComponent:
            return updateHostComponent(workInProgress);
        case HostText:
            return null;
        case FunctionComponent:
            return updateFunctionComponent(workInProgress)
        default:
            console.error("beginwork 未处理")
            return null
    }
};

function updateFunctionComponent(workInProgress: FiberNode) {
    const nextChildren = renderWithHooks(workInProgress);
    reconcileChildFibers(workInProgress, nextChildren)
    return workInProgress.child;
}

function reconcileChildren(workInProgress: FiberNode, children?: ReactElement) {
    const current = workInProgress.alternate
    if(current !== null) {
        workInProgress.child = reconcileChildFibers(
            workInProgress,
            current.child,
            children
        )
    } else {
        workInProgress.child = mountChildFibers(workInProgress, null, children)
    }
}

function updateHostComponent(workInProgress: FiberNode) {
    const nextProps = workInProgress.pendingProps;
    const nextChildren = nextProps.children;
    reconcileChildren(workInProgress, nextChildren)
    return workInProgress.child
}

function updateHostRoot(workInProgress: FiberNode) {
    processUpdateQueue(workInProgress);
    const nextChildren = workInProgress.memoizedState
    reconcileChildren(workInProgress, nextChildren)
    return workInProgress.child
}
import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';
import { MutationMask, NoFlags } from './fiberFlag';

let workInProgress: FiberNode | null = null;

export function scheduleUpdateOnFiber(fiber: FiberNode) {
    const root = markUpdateLaneFromFiberToRoot(fiber);
    if(root === null) {
        return;
    }
    ensureRootIsScheduled(root);
}

function markUpdateLaneFromFiberToRoot(fiber: FiberNode) {
    let node = fiber;
    let parent = node.return;
    while(parent !== null) {
        node = parent;
        parent = node.return
    }

    if(node.tag === HostRoot) {
        return node.stateNode
    }

    return null;
}

function ensureRootIsScheduled(root: FiberRootNode) {
    performSyncWorkOnRoot(root);
}

function performSyncWorkOnRoot(root: FiberRootNode) {
    prepareFreshStack(root);
    do {
        try {
            workLoop();
            break;
        } catch(e) {
            console.error("workLoop 发生错误", e);
            workInProgress = null;
        }
    } while(true)
    if(workInProgress!==null)  {
        console.error("render阶段结束wip不为null")
    }
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
    const finishedWork = root.finishedWork;
    if(finishedWork === null) {
        return;
    }
    root.finishedWork = null;
    const subtreeHasEffect = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
    const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
    if(subtreeHasEffect || rootHasEffect) {
        commitMutationEffects(finishedWork);
        root.current = finishedWork
    } else {
        root.current = finishedWork
    }
}

function prepareFreshStack(root: FiberRootNode) {
    workInProgress = createWorkInProgress(root.current, {})
}

function workLoop() {
    while(workInProgress !== null) {
        performUnitOfWork(workInProgress)
    }
}

function performUnitOfWork(fiber: FiberNode) {
    const next = beginWork(fiber);
    if(next === null) {
        completeUnitOfWork(fiber);
    } else {
        workInProgress = next;
    }
}

function completeUnitOfWork(fiber: FiberNode) {
    let node: FiberNode | null = fiber;
    do {
        const next = completeWork(node);

        if(next!==null) {
            workInProgress = next;
            return;
        }

        const sibling = node.sibling;
        if(sibling) {
            workInProgress = next;
            return;
        }
        node = node.return;
        workInProgress = node;
    }  while(node !== null)
}


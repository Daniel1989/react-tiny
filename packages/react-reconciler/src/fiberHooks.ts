import { Dispatcher, Dispatch } from "../../react/src/currentDispatcher";
import sharedInternals from '../../shared/internals';
import { Action } from "../../shared/ReactTypes";
import { FiberNode } from "./fiber";
import {
    createUpdate,
    enqueueUpdate,
    UpdateQueue,
    createUpdateQueue,
} from './updateQueue';
import { scheduleUpdateOnFiber } from "./workLoop";

let workInProgressHook: Hook | null = null;
let currentlyRenderFiber: FiberNode | null = null;

interface Hook {
    memoizedState: any;
    updateQueue: unknown;
    next: Hook | null;
}

const { currentDispatcher } = sharedInternals;

export const renderWithHooks = (workInProgress: FiberNode) => {
    currentlyRenderFiber = workInProgress;
    workInProgress.memoizedState = null;
    workInProgress.updateQueue = null;

    const current = workInProgress.alternate;
    if(current !== null) {
        console.error('还未实现update时renderWithHooks')
    } else {
        currentDispatcher.current = HooksDispatcherOnMount;
    }

    const Component = workInProgress.type;
    const props = workInProgress.pendingProps;
    const children = Component(props);

    currentlyRenderFiber = null;
    workInProgressHook = null;

    return children;
};

const HooksDispatcherOnMount: Dispatcher = {
    useState: mountState
}

function mountState<State>(
    initialState: (()=>State) | State
): [State, Dispatch<State>] {
    const hook = mountWorkInprogressHook();
    let memoizedState: State;
    if(initialState instanceof Function) {
        memoizedState = initialState()
    } else {
        memoizedState = initialState;
    }
    hook.memoizedState = memoizedState

    if(currentlyRenderFiber === null) {
        console.error("mountState时currentlyRenderingFiber不存在")
    }

    const queue = createUpdateQueue<State>();
    hook.updateQueue = queue;

    return [
        memoizedState,
        dispatchSetState.bind(null, currentlyRenderFiber!, queue as any)
    ]
}

function dispatchSetState<State>(
    fiber: FiberNode,
    updateQueue: UpdateQueue<State>,
    action: Action<State>
) {
    const update = createUpdate(action);
    enqueueUpdate(updateQueue, update);
    scheduleUpdateOnFiber(fiber);
}

function mountWorkInprogressHook(): Hook {
    const hook: Hook = {
        memoizedState: null,
        updateQueue: null,
        next: null,
    }
    if(workInProgressHook === null) {
        if(currentlyRenderFiber === null) {
            console.error("mountWorkInprogressHook时currentlyRenderingFiber未定义")
        } else {
            currentlyRenderFiber.memoizedState = workInProgressHook = hook;
        }
    } else {
        workInProgressHook = workInProgressHook.next = hook;
    } 
    return workInProgressHook as Hook;
}
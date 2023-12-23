import { FiberNode } from './fiber'
import { Action } from '../../shared/ReactTypes';

// type UpdateAction = any;

export interface Update<State> {
    action: Action<State>;
}

export interface UpdateQueue<State> {
    shared: {
        pending: Update<State> | null;
    }
}

export const createUpdate = <State>(action: Action<State>) => {
    return {
        action
    }
}

export const enqueueUpdate = <Action>(updateQueue: UpdateQueue<Action>, update: Update<Action>) => {
    updateQueue.shared.pending = update;    
}

export const createUpdateQueue = <Action>() => {
    const updateQueue: UpdateQueue<Action> = {
        shared: {
            pending: null
        }
    };
    return updateQueue
}

export const processUpdateQueue = <State>(fiber: FiberNode) => {
    const updateQueue = fiber.updateQueue as UpdateQueue<State>;
    let newState: State = fiber.memoizedState;

    if(updateQueue !== null) {
        const pending = updateQueue.shared.pending;
        const pendingUpdate = pending;
        updateQueue.shared.pending = null;

        if(pendingUpdate !== null) {
            const action = pendingUpdate.action;
            if(action instanceof Function) {
                newState = action(newState);
            } else {
                newState = action;
            }
        }
    } else {
        console.error(fiber, ' processUpdateQueue时 updateQueue不存在')
    }
    fiber.memoizedState = newState;
}

export const initializeUpdateQueue = (fiber: FiberNode) => {
    fiber.updateQueue = {
        shared: {
            pending: null
        }
    }
}
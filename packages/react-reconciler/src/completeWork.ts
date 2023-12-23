import { FiberNode } from "./fiber";
import { NoFlags } from "./fiberFlag";
import { createInstance, Instance, createTextInstance } from "./hostConfig";
import { HostComponent, HostRoot, HostText, FunctionComponent } from "./workTags";

const appendAllChildren = (parent: Instance, workInProgress: FiberNode) => {
    let node = workInProgress.child;
    while(node!== null) {
        if(node.tag === HostComponent || node.tag === HostText) {
            appendAllChildren(parent, node.stateNode)
        } else if(node.child !== null)  {
            node.child.return = node;
            node = node.child
            continue
        }

        if(node === workInProgress) {
            return;
        }

        while(node.sibling === null) {
            if(node.return === null || node.return === workInProgress)  {
                return;
            }
            node = node.return
        }
        node.sibling.return = node.return
        node = node.sibling
    }
}

const bubbleProperties = (completeWork: FiberNode) => {
    let subtreeFlags = NoFlags;
    let child = completeWork.child;
    while(child!==null) {
        subtreeFlags |= child.subtreeFlags;
        subtreeFlags |= child.flags

        child.return = completeWork;
        child = child.sibling;
    }
    completeWork.subtreeFlags |= subtreeFlags
}


export const completeWork = (workInProgress: FiberNode) => {
    const newProps = workInProgress.pendingProps;
    switch(workInProgress.tag) {
        case HostComponent:
            const instance = createInstance(workInProgress.type)
            appendAllChildren(instance, workInProgress)
            workInProgress.stateNode = instance

            bubbleProperties(workInProgress)
            return null;
        case HostRoot:
            bubbleProperties(workInProgress)
            return null;
        case HostText:
            const textInstance = createTextInstance(newProps.content)
            workInProgress.stateNode = textInstance;
            bubbleProperties(workInProgress)
            return null;
        case FunctionComponent:
            bubbleProperties(workInProgress)
            return null;
        default:
            console.error('completeWork 未定义fiber.tag', workInProgress)
            return null;
    }
}
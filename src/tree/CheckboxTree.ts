/**
 * jsTree 대체용 커스텀 체크박스 트리 컴포넌트.
 * LayerTree 에서 사용하는 jsTree API 표면만 구현함.
 *
 * @author jhoh
 */

export interface TreeNode {
  id: string;
  data: Record<string, string>;
  children: string[];      // direct child IDs
  children_d: string[];    // all descendant IDs (deep)
  state: { selected: boolean };
}

type EventHandler = (e: Event | null, data: ChangedEventData) => void;

export interface ChangedEventData {
  action: 'select_node' | 'deselect_node' | 'ready';
  node: TreeNode;
}

export class CheckboxTree {
  private container: HTMLElement;
  private nodes: Map<string, TreeNode> = new Map();
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /** HTML 문자열로 트리 초기화 */
  init(html: string): void {
    this.container.innerHTML = html;
    this.buildNodeMap();
    this.bindClickEvents();

    // jsTree 호환: ready 이벤트 발행
    const readyNode: TreeNode = {
      id: '',
      data: {},
      children: [],
      children_d: [],
      state: { selected: false },
    };
    this.emit('changed', { action: 'ready', node: readyNode });
  }

  /** 컨테이너 내부 모든 <li> 를 순회하여 노드 맵 구성 */
  private buildNodeMap(): void {
    this.nodes.clear();
    const allLis = this.container.querySelectorAll('li');

    // 1차 패스: 각 li 를 TreeNode 로 등록
    allLis.forEach((li) => {
      const id = li.id;
      if (!id) return;

      const dataset: Record<string, string> = {};
      for (const key in li.dataset) {
        dataset[key] = li.dataset[key]!;
      }

      this.nodes.set(id, {
        id,
        data: dataset,
        children: [],
        children_d: [],
        state: { selected: false },
      });
    });

    // 2차 패스: 부모-자식 관계 구성
    allLis.forEach((li) => {
      const parentId = li.id;
      if (!parentId || !this.nodes.has(parentId)) return;
      const parentNode = this.nodes.get(parentId)!;

      // 직접 자식: li 바로 아래 ul 의 직접 자식 li 만
      const childUl = li.querySelector(':scope > ul');
      if (childUl) {
        const directChildLis = childUl.querySelectorAll(':scope > li');
        directChildLis.forEach((childLi) => {
          if (childLi.id && this.nodes.has(childLi.id)) {
            parentNode.children.push(childLi.id);
          }
        });
      }
    });

    // 3차 패스: children_d (모든 하위 자손) 구성
    this.nodes.forEach((node) => {
      node.children_d = this.collectAllDescendants(node.id);
    });
  }

  /** 재귀적으로 모든 자손 ID 수집 */
  private collectAllDescendants(nodeId: string): string[] {
    const node = this.nodes.get(nodeId);
    if (!node) return [];
    const result: string[] = [];
    for (const childId of node.children) {
      result.push(childId);
      result.push(...this.collectAllDescendants(childId));
    }
    return result;
  }

  /** 클릭 이벤트 바인딩: <li> 또는 체크박스 클릭 시 토글 */
  private bindClickEvents(): void {
    this.container.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;

      // 컬러픽커 컨테이너, submitter 등에서 클릭 시 트리 토글 방지
      if (target.closest('.colorPickr_container') ||
          target.closest('.colorPickr_palette') ||
          target.classList.contains('submitter')) {
        return;
      }

      // 체크박스 input 클릭이면 해당 li 를 찾아 토글
      let li: HTMLElement | null = null;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
        li = target.closest('li');
      } else if (target.tagName === 'LI') {
        li = target;
      } else if (target.closest('li')) {
        // label, span 등 li 내부 요소 클릭
        li = target.closest('li');
      }

      if (!li || !li.id || !this.nodes.has(li.id)) return;

      const node = this.nodes.get(li.id)!;
      if (node.state.selected) {
        this.deselect_node(li.id);
      } else {
        this.select_node(li.id);
      }
    });
  }

  /** 노드 반환 (jsTree 호환) */
  get_node(id: string): TreeNode | null {
    return this.nodes.get(id) ?? null;
  }

  /** 노드 선택 (체크) */
  select_node(id: string): void {
    const node = this.nodes.get(id);
    if (!node) return;

    node.state.selected = true;

    // 자손 모두 선택
    for (const descId of node.children_d) {
      const desc = this.nodes.get(descId);
      if (desc) desc.state.selected = true;
    }

    this.emit('changed', { action: 'select_node', node });
  }

  /** 노드 선택 해제 (언체크) */
  deselect_node(id: string, suppressEvent?: boolean): void {
    const node = this.nodes.get(id);
    if (!node) return;

    node.state.selected = false;

    // 자손 모두 해제
    for (const descId of node.children_d) {
      const desc = this.nodes.get(descId);
      if (desc) desc.state.selected = false;
    }

    if (!suppressEvent) {
      this.emit('changed', { action: 'deselect_node', node });
    }
  }

  /** jsTree 호환: check_node */
  check_node(node: TreeNode): void {
    this.select_node(node.id);
  }

  /** jsTree 호환: uncheck_node */
  uncheck_node(node: TreeNode): void {
    this.deselect_node(node.id);
  }

  /** 노드가 선택 상태인지 확인 */
  is_selected(id: string): boolean {
    const node = this.nodes.get(id);
    return node ? node.state.selected : false;
  }

  /** 선택된 모든 노드 ID 배열 반환 */
  get_selected(): string[] {
    const result: string[] = [];
    this.nodes.forEach((node) => {
      if (node.state.selected) result.push(node.id);
    });
    return result;
  }

  /** 이벤트 핸들러 등록 */
  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  /** 이벤트 발행 */
  private emit(event: string, data: ChangedEventData): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((fn) => fn(null, data));
    }
  }

  /** 트리 파기 */
  destroy(): void {
    this.nodes.clear();
    this.handlers.clear();
    this.container.innerHTML = '';
  }
}

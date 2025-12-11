const NATIVE_HOST_NAME = "com.applauncher.host";

// 默认数据
const defaultData = {
  categories: [
    { id: "tools", name: "常用工具" },
    { id: "dev", name: "开发工具" },
    { id: "network", name: "网络工具" }
  ],
  apps: [
    { id: "1", name: "记事本", path: "notepad.exe", args: "", categoryId: "tools" },
    { id: "2", name: "计算器", path: "calc.exe", args: "", categoryId: "tools" },
    { id: "3", name: "CMD", path: "cmd.exe", args: "", categoryId: "dev" }
  ]
};

let data = { categories: [], apps: [] };
let currentCategory = null;
let editingItem = null;
let editingType = null;

// DOM 元素
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");
const statusBar = document.getElementById("statusBar");
const categoryModal = document.getElementById("categoryModal");
const appModal = document.getElementById("appModal");
const editModal = document.getElementById("editModal");

// 初始化
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  renderSidebar();
  if (data.categories.length > 0) {
    selectCategory(data.categories[0].id);
  }
  bindEvents();
});

// 加载数据
async function loadData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["launcherData"], (result) => {
      if (result.launcherData) {
        data = result.launcherData;
      } else {
        data = defaultData;
        saveData();
      }
      resolve();
    });
  });
}

// 保存数据
function saveData() {
  chrome.storage.local.set({ launcherData: data });
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 渲染侧边栏
function renderSidebar() {
  sidebar.innerHTML = data.categories.map(cat => `
    <div class="sidebar-item ${cat.id === currentCategory ? 'active' : ''}" data-id="${cat.id}">
      <span>${cat.name}</span>
      <button class="edit-btn" data-edit-cat="${cat.id}">✏️</button>
    </div>
  `).join("");
}

// 渲染应用列表
function renderApps() {
  const apps = data.apps.filter(app => app.categoryId === currentCategory);

  if (apps.length === 0) {
    content.innerHTML = '<div class="empty-state">暂无应用，点击右上角 +📱 添加</div>';
    return;
  }

  content.innerHTML = apps.map(app => `
    <div class="app-item" data-id="${app.id}">
      <button class="edit-btn" data-edit-app="${app.id}">✏️</button>
      <div class="app-icon">${getAppIcon(app.name)}</div>
      <div class="app-name">${app.name}</div>
    </div>
  `).join("");
}

// 获取应用图标（取名称首字）
function getAppIcon(name) {
  return name.charAt(0).toUpperCase();
}

// 选择分类
function selectCategory(categoryId) {
  currentCategory = categoryId;
  renderSidebar();
  renderApps();
}

// 启动应用
function launchApp(appId) {
  const app = data.apps.find(a => a.id === appId);
  if (!app) return;

  setStatus(`正在启动 ${app.name}...`);

  try {
    chrome.runtime.sendNativeMessage(
      NATIVE_HOST_NAME,
      { action: "launch", path: app.path, args: app.args },
      (response) => {
        if (chrome.runtime.lastError) {
          setStatus(`错误: ${chrome.runtime.lastError.message}`);
          console.error(chrome.runtime.lastError);
          // 显示安装提示
          if (chrome.runtime.lastError.message.includes("not found")) {
            alert("未找到本地服务！\n\n请先运行 native-host 目录下的 install.bat 安装本地服务。");
          }
          return;
        }
        if (response && response.success) {
          setStatus(`${app.name} 已启动`);
        } else {
          setStatus(`启动失败: ${response ? response.error : '未知错误'}`);
        }
      }
    );
  } catch (e) {
    setStatus(`错误: ${e.message}`);
  }
}

// 设置状态栏
function setStatus(text) {
  statusBar.textContent = text;
}

// 绑定事件
function bindEvents() {
  // 侧边栏点击
  sidebar.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit-cat]");
    if (editBtn) {
      e.stopPropagation();
      const catId = editBtn.dataset.editCat;
      openEditModal("category", catId);
      return;
    }

    const item = e.target.closest(".sidebar-item");
    if (item) {
      selectCategory(item.dataset.id);
    }
  });

  // 应用点击
  content.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit-app]");
    if (editBtn) {
      e.stopPropagation();
      const appId = editBtn.dataset.editApp;
      openEditModal("app", appId);
      return;
    }

    const item = e.target.closest(".app-item");
    if (item) {
      launchApp(item.dataset.id);
    }
  });

  // 添加分类
  document.getElementById("addCategoryBtn").addEventListener("click", () => {
    categoryModal.classList.add("show");
    document.getElementById("categoryName").value = "";
    document.getElementById("categoryName").focus();
  });

  // 保存分类
  document.getElementById("saveCategoryBtn").addEventListener("click", () => {
    const name = document.getElementById("categoryName").value.trim();
    if (!name) return;

    data.categories.push({ id: generateId(), name });
    saveData();
    renderSidebar();
    categoryModal.classList.remove("show");
    setStatus(`分类 "${name}" 已添加`);
  });

  // 取消分类
  document.getElementById("cancelCategoryBtn").addEventListener("click", () => {
    categoryModal.classList.remove("show");
  });

  // 添加应用
  document.getElementById("addAppBtn").addEventListener("click", () => {
    appModal.classList.add("show");
    document.getElementById("appName").value = "";
    document.getElementById("appPath").value = "";
    document.getElementById("appArgs").value = "";

    // 填充分类选项
    const select = document.getElementById("appCategory");
    select.innerHTML = data.categories.map(cat =>
      `<option value="${cat.id}" ${cat.id === currentCategory ? 'selected' : ''}>${cat.name}</option>`
    ).join("");

    document.getElementById("appName").focus();
  });

  // 保存应用
  document.getElementById("saveAppBtn").addEventListener("click", () => {
    const name = document.getElementById("appName").value.trim();
    const path = document.getElementById("appPath").value.trim();
    const args = document.getElementById("appArgs").value.trim();
    const categoryId = document.getElementById("appCategory").value;

    if (!name || !path) {
      alert("请填写应用名称和路径");
      return;
    }

    data.apps.push({ id: generateId(), name, path, args, categoryId });
    saveData();
    renderApps();
    appModal.classList.remove("show");
    setStatus(`应用 "${name}" 已添加`);
  });

  // 取消应用
  document.getElementById("cancelAppBtn").addEventListener("click", () => {
    appModal.classList.remove("show");
  });

  // 编辑保存
  document.getElementById("saveEditBtn").addEventListener("click", saveEdit);

  // 编辑删除
  document.getElementById("deleteEditBtn").addEventListener("click", deleteEdit);

  // 编辑取消
  document.getElementById("cancelEditBtn").addEventListener("click", () => {
    editModal.classList.remove("show");
  });

  // 设置按钮
  document.getElementById("settingsBtn").addEventListener("click", () => {
    if (confirm("是否重置所有数据为默认值？")) {
      data = JSON.parse(JSON.stringify(defaultData));
      saveData();
      currentCategory = data.categories[0]?.id;
      renderSidebar();
      renderApps();
      setStatus("已重置为默认数据");
    }
  });

  // 点击模态框外部关闭
  [categoryModal, appModal, editModal].forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    });
  });
}

// 打开编辑对话框
function openEditModal(type, id) {
  editingType = type;

  if (type === "category") {
    const cat = data.categories.find(c => c.id === id);
    if (!cat) return;
    editingItem = cat;

    document.getElementById("editModalTitle").textContent = "编辑分类";
    document.getElementById("editName").value = cat.name;
    document.getElementById("editPath").style.display = "none";
    document.getElementById("editArgs").style.display = "none";
  } else {
    const app = data.apps.find(a => a.id === id);
    if (!app) return;
    editingItem = app;

    document.getElementById("editModalTitle").textContent = "编辑应用";
    document.getElementById("editName").value = app.name;
    document.getElementById("editPath").value = app.path;
    document.getElementById("editPath").style.display = "block";
    document.getElementById("editArgs").value = app.args || "";
    document.getElementById("editArgs").style.display = "block";
  }

  editModal.classList.add("show");
}

// 保存编辑
function saveEdit() {
  const name = document.getElementById("editName").value.trim();
  if (!name) return;

  if (editingType === "category") {
    editingItem.name = name;
    renderSidebar();
  } else {
    editingItem.name = name;
    editingItem.path = document.getElementById("editPath").value.trim();
    editingItem.args = document.getElementById("editArgs").value.trim();
    renderApps();
  }

  saveData();
  editModal.classList.remove("show");
  setStatus("已保存");
}

// 删除编辑项
function deleteEdit() {
  if (!confirm("确定要删除吗？")) return;

  if (editingType === "category") {
    // 同时删除该分类下的所有应用
    data.apps = data.apps.filter(app => app.categoryId !== editingItem.id);
    data.categories = data.categories.filter(c => c.id !== editingItem.id);

    if (currentCategory === editingItem.id) {
      currentCategory = data.categories[0]?.id || null;
    }
    renderSidebar();
    renderApps();
  } else {
    data.apps = data.apps.filter(a => a.id !== editingItem.id);
    renderApps();
  }

  saveData();
  editModal.classList.remove("show");
  setStatus("已删除");
}

// 关于按钮事件
document.getElementById("aboutBtn").addEventListener("click", () => {
  document.getElementById("aboutModal").classList.add("show");
});

document.getElementById("closeAboutBtn").addEventListener("click", () => {
  document.getElementById("aboutModal").classList.remove("show");
});

document.getElementById("aboutModal").addEventListener("click", (e) => {
  if (e.target.id === "aboutModal") {
    document.getElementById("aboutModal").classList.remove("show");
  }
});

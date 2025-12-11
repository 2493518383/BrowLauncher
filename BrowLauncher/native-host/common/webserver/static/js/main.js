
// 自动刷新日志内容
function refreshLogs() {
    fetch('/api/logs')
        .then(response => response.json())
        .then(data => {
            const logContainer = document.getElementById('log-content');
            if (logContainer && data.content) {
                logContainer.textContent = data.content;
                
                // 只有当滚动条在底部附近时才自动滚动
                const isAtBottom = logContainer.scrollHeight - logContainer.scrollTop - logContainer.clientHeight < 50;
                if (isAtBottom) {
                    logContainer.scrollTop = logContainer.scrollHeight;
                }
                
                // 更新最后更新时间
                const lastUpdate = document.getElementById('last-update');
                if (lastUpdate) {
                    lastUpdate.textContent = new Date().toLocaleTimeString();
                }
            }
        })
        .catch(error => console.error('获取日志失败:', error));
}

// 格式化时间
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 添加动画效果
document.addEventListener('DOMContentLoaded', function() {
    // 为所有卡片添加淡入动画
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // 如果在日志页面，设置日志刷新
    const logContainer = document.getElementById('log-content');
    if (logContainer) {
        // 初始滚动到底部
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // 每秒刷新一次日志
        setInterval(refreshLogs, 1000);
    }
    
    // 为表格行添加悬停效果
    const tableRows = document.querySelectorAll('table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = '#f5f7fa';
            row.style.transition = 'background-color 0.2s ease';
        });
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });
    
    // 为按钮添加点击动画
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        button.addEventListener('mouseup', () => {
            button.style.transform = '';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
});

// 添加功能：复制内容到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // 显示复制成功的提示
        showToast('复制成功');
    }).catch(err => {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制');
    });
}

// 显示提示消息
function showToast(message) {
    // 创建Toast元素
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#333';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '1000';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    
    // 添加到文档
    document.body.appendChild(toast);
    
    // 显示和隐藏
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

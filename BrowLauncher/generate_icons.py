"""生成插件图标"""
try:
    from PIL import Image, ImageDraw
except ImportError:
    print("需要安装 Pillow: pip install Pillow")
    exit(1)

def create_icon(size):
    # 创建图像
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 绘制圆角背景
    padding = size // 10
    draw.rounded_rectangle(
        [0, 0, size-1, size-1],
        radius=size//6,
        fill=(102, 126, 234)
    )

    # 绘制 4 个方块
    block_size = size // 4
    gap = size // 16
    start_x = (size - 2*block_size - gap) // 2
    start_y = (size - 2*block_size - gap) // 2

    positions = [
        (start_x, start_y),
        (start_x + block_size + gap, start_y),
        (start_x, start_y + block_size + gap),
        (start_x + block_size + gap, start_y + block_size + gap)
    ]

    for x, y in positions:
        draw.rounded_rectangle(
            [x, y, x + block_size - 2, y + block_size - 2],
            radius=size//20,
            fill=(255, 255, 255)
        )

    return img

# 生成不同尺寸的图标
sizes = [16, 48, 128]
for s in sizes:
    icon = create_icon(s)
    icon.save(f'extension/icons/icon{s}.png')
    print(f'已生成 icon{s}.png')

print('图标生成完成!')

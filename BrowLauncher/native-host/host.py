#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Native Messaging Host for App Launcher
用于接收浏览器插件消息并启动本地应用程序
"""

import sys
import json
import struct
import subprocess
import os

def send_message(message):
    """发送消息到浏览器插件"""
    encoded = json.dumps(message).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('I', len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()

def read_message():
    """读取来自浏览器插件的消息"""
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length:
        return None
    message_length = struct.unpack('I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

def launch_app(path, args=""):
    """启动应用程序或打开文件夹"""
    try:
        # 去除路径两端空格和尾部斜杠
        path = path.strip().rstrip('/\\')

        # 判断路径类型
        is_directory = os.path.isdir(path)
        is_file = os.path.isfile(path)

        if sys.platform == 'win32':
            DETACHED_PROCESS = 0x00000008
            CREATE_NEW_PROCESS_GROUP = 0x00000200

            if is_directory:
                # 如果是文件夹，用 explorer 打开
                cmd = f'explorer.exe "{path}"'
            elif is_file:
                # 如果是文件，直接运行
                if args:
                    cmd = f'"{path}" {args}'
                else:
                    cmd = f'"{path}"'
            else:
                # 可能是系统命令（如 notepad.exe, calc.exe）
                if args:
                    cmd = f'"{path}" {args}'
                else:
                    cmd = f'"{path}"'

            subprocess.Popen(
                cmd,
                shell=True,
                stdin=None,
                stdout=None,
                stderr=None,
                creationflags=DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP
            )
        else:
            # Linux/Mac
            if is_directory:
                cmd = f'xdg-open "{path}"'
            elif args:
                cmd = f'"{path}" {args}'
            else:
                cmd = f'"{path}"'

            subprocess.Popen(
                cmd,
                shell=True,
                stdin=None,
                stdout=None,
                stderr=None,
                start_new_session=True
            )

        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    """主循环"""
    while True:
        message = read_message()
        if message is None:
            break

        action = message.get("action")

        if action == "launch":
            path = message.get("path", "")
            args = message.get("args", "")
            result = launch_app(path, args)
            send_message(result)
        elif action == "ping":
            send_message({"success": True, "message": "pong"})
        else:
            send_message({"success": False, "error": "Unknown action"})

if __name__ == "__main__":
    main()

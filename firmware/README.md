# Smart Waste Sorting Firmware — TASK 1

Firmware ESP-IDF tối thiểu cho **ESP32 DevKit V1**, target `esp32`.
Ứng dụng chỉ in log khởi động, phiên bản ESP-IDF, thông tin chip và heartbeat
mỗi 5 giây qua console UART 115200 baud. Không khởi tạo GPIO, cảm biến,
servo, động cơ, Wi-Fi hoặc MQTT.

## Môi trường Windows

- ESP-IDF chính thức: **v5.5.5**, `C:\esp\v5.5.5\esp-idf`.
- Tools: `C:\Espressif`.
- Python riêng: `C:\Espressif\python_env\idf5.5_py3.11_env` (Python 3.11.9).
- Extension: `espressif.esp-idf-extension` **2.3.0**.
- CMake **3.30.2**, Ninja **1.12.1**.
- Xtensa ESP32: `xtensa-esp-elf`, **esp-14.2.0_20260121**.
  Đây là tên toolchain hợp nhất dùng cho ESP32 trong bản IDF này.

Không cần đặt IDF_PATH toàn hệ thống. Script và cấu hình VS Code chỉ dùng
các đường dẫn trên trong môi trường firmware. Nếu chuyển máy, cập nhật
`esp-idf.ps1` và `.vscode/settings.json` theo đường dẫn cài đặt thực tế.

## Mở lại environment và build

Từ thư mục gốc project, mở PowerShell:

```powershell
# Chỉ áp dụng cho terminal hiện tại nếu execution policy chặn script.
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
. .\firmware\esp-idf.ps1
Set-Location .\firmware
idf.py --version
idf.py set-target esp32
idf.py build
```

`set-target` chỉ cần khi khởi tạo hoặc đổi target; lệnh này tái tạo cấu hình
và build directory của firmware. Những lần tiếp theo chỉ cần `idf.py build`.
Không chạy flash trong TASK 1.

Có thể build trực tiếp từ thư mục gốc mà không đổi thư mục:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\firmware\esp-idf.ps1 -Action Build
```

## VS Code

1. Sau khi khôi phục extension, lưu công việc và chạy **Developer: Reload Window**.
2. Mở `ecosmart-firmware.code-workspace` ở thư mục gốc để thấy cả `firmware`,
   `frontend`, `backend`; hoặc mở riêng folder `firmware` trong cửa sổ mới.
3. Chọn một file trong `firmware`. Cấu hình folder `.vscode/settings.json`
   chọn `idf.currentSetup` và truyền `IDF_PATH`, `IDF_TOOLS_PATH`,
   `IDF_PYTHON_ENV_PATH` cho extension. Extension tự export đường dẫn tools
   từ setup đã chọn; không phụ thuộc vào registry EIM cũ đã mất.
4. Chạy **ESP-IDF: Doctor Command** để kiểm tra extension host trong phiên
   VS Code thực tế, rồi **ESP-IDF: Open ESP-IDF Terminal** và
   **ESP-IDF: Build your Project**. Chọn folder `firmware` nếu được hỏi.
5. Với cửa sổ đang mở folder gốc ban đầu, dùng **Tasks: Run Task →
   ESP-IDF: Build firmware (no flash)**; task tự nạp environment.

Không dùng **Build, Flash and Monitor** trong task này. Chưa kiểm tra log
trên board vì chưa flash. Việc build không cần nối board hoặc chọn cổng COM.

## File nguồn

```text
firmware/
├── CMakeLists.txt
├── sdkconfig.defaults
├── main/
│   ├── CMakeLists.txt
│   └── main.c
├── esp-idf.ps1
├── .gitignore
├── .vscode/
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
└── README.md
```

`sdkconfig` và `build/` được ESP-IDF sinh khi cấu hình/build; không phải
file nguồn cần chỉnh tay. `sdkconfig.defaults` được giữ trong source.

## Kết quả thực tế ngày 11/11/2026

Ban đầu chỉ còn log EIM xác nhận từng cài v5.5.5; các thư mục framework,
tools, Python ESP-IDF và file extension đã mất. Đã khôi phục đúng v5.5.5
và extension 2.3.0, không cài thêm phiên bản framework khác. Chỉ cài tools
cho ESP32 bằng `idf_tools.py install --targets=esp32`.

- `idf.py --version`: **ESP-IDF v5.5.5**, exit code 0.
- `idf.py set-target esp32`: **PASS**, exit code 0.
- `idf.py build`: **PASS**, exit code 0, `Project build complete`.
- App binary: `build/smart_waste_sorting.bin`, **136912 bytes** (`0x216d0`),
  còn 87% app partition mặc định.
- Sinh cả bootloader, partition table và `smart_waste_sorting.elf`.
- `pip check`: **No broken requirements found**.
- SHA-256 của 35 file hiện có ngoài `node_modules` trong Frontend/Backend
  không thay đổi.

Log lệnh nằm trong `set-target.log` và `build.log` (không đưa vào Git).
Các dòng gợi ý flash ở cuối log do ESP-IDF tự in; chưa thực thi flash.

Đã sửa lỗi wheel `esptool` tạo tên `unknown-0.0.0` bằng setuptools
**80.10.2** trong virtual environment riêng, sau đó cài requirements core
với `--no-build-isolation` và constraints v5.5 chính thức. Framework và
constraints không bị chỉnh sửa. Khi phải dựng lại Python environment,
dùng Python 3.11 và cùng cách xử lý nếu gặp lại lỗi đóng gói này.

### Giới hạn kiểm tra VS Code

Đã chạy extension host kiểm thử riêng: extension 2.3.0 kích hoạt thành công,
đăng ký lệnh build và nhận đúng đường dẫn IDF/Python v5.5.5. Doctor ban đầu
chưa nhận tools; đã bổ sung `idf.currentSetup` để nạp setup và file
`launch.json` rỗng vì Doctor của bản extension này cố đọc file đó.

Chưa xác minh lại Doctor/nút build với cấu hình cuối: VS Code đang giữ
mutex `vscode-updating` và từ chối mở extension host mới với lỗi
`Code is currently being updated. Please wait for the update to complete before launching.`
Sau khi VS Code cập nhật xong, reload cửa sổ và kiểm tra Doctor/Build theo
các bước phía trên. Kết quả build CLI đã PASS độc lập với giới hạn này.
Nếu Doctor liệt kê RISC-V/DFU thiếu, các tools đó không dùng cho ESP32
DevKit V1 qua UART trong TASK 1; chưa cài thêm tools cho target khác.

## Nguồn tham khảo chính thức

- [ESP-IDF v5.5.5](https://github.com/espressif/esp-idf/tree/v5.5.5)
- [Cấu hình environment thủ công cho extension](https://docs.espressif.com/projects/vscode-esp-idf-extension/en/latest/installation.html#manual-configuration-of-esp-idf-and-tools-in-the-esp-idf-extension-for-vs-code)
- [Các thiết lập extension](https://docs.espressif.com/projects/vscode-esp-idf-extension/en/latest/settings.html)

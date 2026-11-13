cmake_minimum_required(VERSION 3.16)

# Only compile the application's explicitly required ESP-IDF components.
set(COMPONENTS main)
include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(smart_waste_sorting)

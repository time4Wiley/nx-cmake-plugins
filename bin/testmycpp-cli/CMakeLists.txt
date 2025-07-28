include(../../.cmake/workspace.cmake)

cmake_minimum_required(VERSION 3.21)

set(PROJECT_NAME testmycpp-cli)
set(PROJECT_TYPE TEST)
set(LANGUAGE CXX)

set_project_settings(${PROJECT_NAME} ${CMAKE_CURRENT_SOURCE_DIR})

project(${PROJECT_NAME} LANGUAGES ${LANGUAGE})

set_binary_settings(${PROJECT_NAME} ${CMAKE_CURRENT_SOURCE_DIR})

enable_testing()

install_gtest()

link_gtest(${PROJECT_NAME})

include(GoogleTest)
gtest_discover_tests(${PROJECT_NAME})

link_library(${PROJECT_NAME} mycpp-cli)

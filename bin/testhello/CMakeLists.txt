include(../../.cmake/workspace.cmake)

cmake_minimum_required(VERSION 3.21)

set(PROJECT_NAME testhello)
set(PROJECT_TYPE TEST)
set(LANGUAGE C)

set_project_settings(${PROJECT_NAME} ${CMAKE_CURRENT_SOURCE_DIR})

project(${PROJECT_NAME} LANGUAGES ${LANGUAGE})

set_binary_settings(${PROJECT_NAME} ${CMAKE_CURRENT_SOURCE_DIR})

enable_testing()

install_cmocka()

link_cmocka(${PROJECT_NAME})

add_test(UnitTests ${PROJECT_NAME})

link_library(${PROJECT_NAME} hello)

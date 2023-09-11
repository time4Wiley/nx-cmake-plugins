function(install_gtest)
    set(FETCHCONTENT_BASE_DIR ${CMAKE_LIBRARY_PATH}/gtest)

    FetchContent_Declare(
        googletest
        GIT_REPOSITORY https://github.com/google/googletest
        GIT_TAG        v1.13.0
        GIT_SHALLOW    1
        OVERRIDE_FIND_PACKAGE
    )

    set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
    find_package(googletest REQUIRED)
endfunction()

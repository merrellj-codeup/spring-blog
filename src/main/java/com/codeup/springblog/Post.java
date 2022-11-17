package com.codeup.springblog;
import javax.persistence.*;

@Entity
@Table (name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column (nullable = false, length = 255)
    private String title;

    @Column(nullable = false)
    private String excerpt;
}

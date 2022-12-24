import { Component, OnDestroy, OnInit } from "@angular/core";
import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy{
  posts: Post[] = [];
  private postsSub!: Subscription;
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  pageSizeOptions = [1, 2, 5, 10];
  currentPage = 1;
  private authStatusSubs: Subscription;
  public userIsAuthed = false;
  userId: string;

  constructor(public postsService: PostsService, public authService: AuthService){}

  ngOnInit(){
    this.isLoading = true
    this.postsService.getPosts(this.postsPerPage, this.currentPage)
    this.userId = this.authService.getUserId()
    this.postsSub = this.postsService.getPostUpdateListner()
      .subscribe((postsData: {posts: Post[], postCount: number}) => {
        this.isLoading = false;
        this.totalPosts = postsData.postCount;
        this.posts = postsData.posts
      })
    this.userIsAuthed = this.authService.getIsAuthed();
    this.authStatusSubs = this.authService.getAuthStatusListener()
      .subscribe(isAuthed => {
        this.userIsAuthed = isAuthed;
        this.userId = this.authService.getUserId()
      })
  }

  onChangedPage(pageData: PageEvent){
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage)
  }

  onDelete(postId: string){
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage)
    }, () => {
      this.isLoading = false;
    })
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe()
    this.authStatusSubs.unsubscribe()
  }

}
